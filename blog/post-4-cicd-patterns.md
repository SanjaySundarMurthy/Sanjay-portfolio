---
title: CI/CD Pipeline Patterns That Actually Work in Production
published: false
description: Reusable pipeline architectures for Azure DevOps and GitHub Actions — template patterns, security gates, artifact management, and multi-environment promotion strategies from managing 50+ pipelines.
tags: devops, cicd, azure, githubactions
---

After building and maintaining **50+ CI/CD pipelines** across Azure DevOps and GitHub Actions, I've identified the patterns that scale and the anti-patterns that slowly destroy your team's velocity.

Here's the playbook.

---

## The Anti-Patterns First

Before the good stuff, recognize these traps:

```
❌ ANTI-PATTERN 1: Copy-paste pipelines
   → 50 services = 50 slightly different YAML files
   → One security fix = 50 PRs

❌ ANTI-PATTERN 2: No quality gates
   → "It compiles, ship it"
   → Production is your testing environment

❌ ANTI-PATTERN 3: Manual approvals everywhere
   → "Can someone approve my staging deploy?"
   → 3-hour wait because the approver is in a meeting

❌ ANTI-PATTERN 4: No artifact versioning
   → "Which build is in production?"
   → "I don't know, let me check the logs"

❌ ANTI-PATTERN 5: Secrets in pipeline YAML
   → "It's fine, the repo is private"
   → Narrator: It was not fine.
```

---

## Pattern 1: The Template Pipeline

**The single most impactful pattern.** Write the pipeline once, consume it everywhere.

### Azure DevOps — Template in a Shared Repo

```yaml
# File: templates/dotnet-ci.yml (shared repo)
parameters:
  - name: projectPath
    type: string
  - name: dockerfilePath
    type: string
    default: 'Dockerfile'
  - name: runTests
    type: boolean
    default: true
  - name: sonarqubeEnabled
    type: boolean
    default: true

stages:
  - stage: Build
    jobs:
      - job: BuildAndTest
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: UseDotNet@2
            inputs:
              version: '8.x'

          - script: dotnet restore ${{ parameters.projectPath }}
            displayName: 'Restore packages'

          - script: dotnet build ${{ parameters.projectPath }} --no-restore -c Release
            displayName: 'Build'

          - ${{ if eq(parameters.runTests, true) }}:
            - script: |
                dotnet test ${{ parameters.projectPath }} \
                  --no-build -c Release \
                  --collect:"XPlat Code Coverage" \
                  --results-directory $(Agent.TempDirectory)/coverage
              displayName: 'Run tests'

            - task: PublishCodeCoverageResults@2
              inputs:
                summaryFileLocation: '$(Agent.TempDirectory)/coverage/**/coverage.cobertura.xml'

          - ${{ if eq(parameters.sonarqubeEnabled, true) }}:
            - task: SonarQubePrepare@6
              inputs:
                SonarQube: 'sonarqube-connection'
                scannerMode: 'dotnet'
                projectKey: '${{ parameters.projectPath }}'

            - task: SonarQubeAnalyze@6
            - task: SonarQubePublish@6

          - task: Docker@2
            displayName: 'Build & Push Image'
            inputs:
              containerRegistry: 'acr-connection'
              repository: '${{ parameters.projectPath }}'
              command: 'buildAndPush'
              Dockerfile: '${{ parameters.dockerfilePath }}'
              tags: |
                $(Build.BuildId)
                $(Build.SourceBranchName)-$(Build.BuildId)
                latest
```

### Consuming the Template

```yaml
# File: azure-pipelines.yml (in each service repo)
# This is ALL a team needs to write:
resources:
  repositories:
    - repository: templates
      type: git
      name: DevOps/pipeline-templates
      ref: refs/heads/main

trigger:
  branches:
    include: [main, develop]

extends:
  template: templates/dotnet-ci.yml@templates
  parameters:
    projectPath: 'src/OrderService'
    dockerfilePath: 'src/OrderService/Dockerfile'
    runTests: true
    sonarqubeEnabled: true
```

**Result:** 50 services, one pipeline definition. Update the template → all services get the improvement on next run.

---

### GitHub Actions — Reusable Workflows

```yaml
# File: .github/workflows/reusable-build.yml (template repo)
name: Reusable Build Pipeline

on:
  workflow_call:
    inputs:
      service-name:
        required: true
        type: string
      dockerfile-path:
        required: false
        type: string
        default: './Dockerfile'
      run-tests:
        required: false
        type: boolean
        default: true
    secrets:
      REGISTRY_USERNAME:
        required: true
      REGISTRY_PASSWORD:
        required: true
      SONAR_TOKEN:
        required: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to ACR
        uses: docker/login-action@v3
        with:
          registry: myregistry.azurecr.io
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ${{ inputs.dockerfile-path }}
          push: true
          tags: |
            myregistry.azurecr.io/${{ inputs.service-name }}:${{ github.sha }}
            myregistry.azurecr.io/${{ inputs.service-name }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  test:
    if: ${{ inputs.run-tests }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: dotnet test --collect:"XPlat Code Coverage"

  security-scan:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Trivy vulnerability scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myregistry.azurecr.io/${{ inputs.service-name }}:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'
```

### Calling the Reusable Workflow

```yaml
# File: .github/workflows/ci.yml (in each service repo)
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    uses: my-org/pipeline-templates/.github/workflows/reusable-build.yml@main
    with:
      service-name: order-service
      run-tests: true
    secrets:
      REGISTRY_USERNAME: ${{ secrets.ACR_USERNAME }}
      REGISTRY_PASSWORD: ${{ secrets.ACR_PASSWORD }}
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

## Pattern 2: The Quality Gate Pipeline

No code reaches production without passing these gates:

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Build   │──▶│  Test    │──▶│ Security │──▶│  Quality │──▶│  Deploy  │
│          │   │          │   │   Scan   │   │   Gate   │   │          │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                   │               │               │
              ≥80% code      No CRITICAL     SonarQube
              coverage        vulns in       Quality Gate
                             container        passed
```

### Security Scanning Stage

```yaml
- stage: SecurityScan
  dependsOn: Build
  jobs:
    - job: ContainerScan
      steps:
        # Scan container image for vulnerabilities
        - script: |
            trivy image \
              --exit-code 1 \
              --severity CRITICAL,HIGH \
              --ignore-unfixed \
              --format json \
              --output trivy-report.json \
              $(ACR_REGISTRY)/$(IMAGE_NAME):$(Build.BuildId)
          displayName: 'Trivy Container Scan'
          continueOnError: false  # FAIL the pipeline on CRITICAL

    - job: DependencyScan
      steps:
        # Scan dependencies for known vulnerabilities
        - script: |
            snyk test \
              --severity-threshold=high \
              --json-file-output=snyk-report.json
          displayName: 'Snyk Dependency Scan'

    - job: SecretsScan
      steps:
        # Scan for accidentally committed secrets
        - script: |
            gitleaks detect \
              --source=. \
              --report-format=json \
              --report-path=gitleaks-report.json
          displayName: 'GitLeaks Secret Scan'
```

### Quality Gate

```yaml
- stage: QualityGate
  dependsOn: SecurityScan
  jobs:
    - job: EvaluateQuality
      steps:
        - script: |
            # Check code coverage threshold
            COVERAGE=$(cat coverage-report.json | jq '.summary.lineCoverage')
            if (( $(echo "$COVERAGE < 80" | bc -l) )); then
              echo "##vso[task.logissue type=error]Code coverage $COVERAGE% is below 80% threshold"
              exit 1
            fi
            echo "Coverage: $COVERAGE% ✅"
          displayName: 'Coverage Gate'

        - task: SonarQubeQualityGate@1
          displayName: 'SonarQube Gate'
          timeoutInMinutes: 5
```

---

## Pattern 3: Multi-Environment Promotion

Build once. Deploy many times. The image that goes to production is the **exact same binary** that passed all tests.

```
        Build Once
            │
            ▼
    ┌───────────────┐
    │  Container     │
    │  Registry      │
    │  (ACR)         │
    │                │
    │  v1.2.3-abc123 │ ◄── Single immutable artifact
    └───────┬───────┘
            │
     ┌──────┼──────┐
     ▼      ▼      ▼
   ┌────┐ ┌────┐ ┌────┐
   │DEV │ │STG │ │PRD │
   │    │ │    │ │    │
   │Auto│ │Auto│ │Gate│ ◄── Manual approval for prod
   └────┘ └────┘ └────┘
```

### Implementation

```yaml
stages:
  - stage: Build
    jobs:
      - job: BuildImage
        steps:
          - script: |
              VERSION="$(Build.BuildId)"
              docker build -t $(ACR)/$(IMAGE):$VERSION .
              docker push $(ACR)/$(IMAGE):$VERSION
              echo "##vso[task.setvariable variable=imageTag;isOutput=true]$VERSION"
            name: setVersion

  - stage: DeployDev
    dependsOn: Build
    variables:
      imageTag: $[ stageDependencies.Build.BuildImage.outputs['setVersion.imageTag'] ]
    jobs:
      - deployment: DeployToDev
        environment: 'dev'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: HelmDeploy@0
                  inputs:
                    command: 'upgrade'
                    chartPath: './charts/myapp'
                    releaseName: 'myapp'
                    overrideValues: 'image.tag=$(imageTag)'
                    namespace: 'dev'

  - stage: DeployStaging
    dependsOn: DeployDev
    # Auto-deploy to staging after dev succeeds
    jobs:
      - deployment: DeployToStaging
        environment: 'staging'
        strategy:
          runOnce:
            deploy:
              steps:
                - task: HelmDeploy@0
                  inputs:
                    command: 'upgrade'
                    chartPath: './charts/myapp'
                    releaseName: 'myapp'
                    overrideValues: 'image.tag=$(imageTag)'
                    namespace: 'staging'

  - stage: DeployProduction
    dependsOn: DeployStaging
    # Manual approval required
    jobs:
      - deployment: DeployToProduction
        environment: 'production'  # Has approval gate in Azure DevOps
        strategy:
          runOnce:
            deploy:
              steps:
                - task: HelmDeploy@0
                  inputs:
                    command: 'upgrade'
                    chartPath: './charts/myapp'
                    releaseName: 'myapp'
                    overrideValues: 'image.tag=$(imageTag)'
                    namespace: 'production'
```

---

## Pattern 4: Semantic Versioning in CI

Automatic versioning based on commit messages:

```yaml
# GitHub Actions
- name: Determine version
  id: version
  run: |
    # Get latest tag
    LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0")
    MAJOR=$(echo $LATEST_TAG | cut -d. -f1 | tr -d 'v')
    MINOR=$(echo $LATEST_TAG | cut -d. -f2)
    PATCH=$(echo $LATEST_TAG | cut -d. -f3)
    
    # Check commit messages since last tag
    COMMITS=$(git log $LATEST_TAG..HEAD --pretty=format:"%s")
    
    if echo "$COMMITS" | grep -qi "BREAKING CHANGE\|^feat!"; then
      MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0
    elif echo "$COMMITS" | grep -qi "^feat"; then
      MINOR=$((MINOR + 1)); PATCH=0
    else
      PATCH=$((PATCH + 1))
    fi
    
    NEW_VERSION="v${MAJOR}.${MINOR}.${PATCH}"
    echo "version=$NEW_VERSION" >> $GITHUB_OUTPUT

- name: Tag release
  run: |
    git tag ${{ steps.version.outputs.version }}
    git push origin ${{ steps.version.outputs.version }}
```

### Commit Convention

```
feat: add user authentication       → v1.1.0 (minor bump)
fix: resolve memory leak            → v1.0.1 (patch bump)
feat!: redesign API endpoints       → v2.0.0 (major bump)
docs: update README                 → v1.0.1 (patch bump)
chore: update dependencies          → v1.0.1 (patch bump)
```

---

## Pattern 5: Pipeline Notifications That Don't Get Ignored

```yaml
# Post-deployment notification to Microsoft Teams
- task: IncomingWebhook@1
  condition: always()
  inputs:
    url: '$(TEAMS_WEBHOOK_URL)'
    body: |
      {
        "@type": "MessageCard",
        "themeColor": "${{ eq(variables['Agent.JobStatus'], 'Succeeded') && '00FF00' || 'FF0000' }}",
        "title": "Deployment: $(Build.DefinitionName)",
        "sections": [{
          "facts": [
            { "name": "Service", "value": "$(IMAGE_NAME)" },
            { "name": "Version", "value": "$(imageTag)" },
            { "name": "Environment", "value": "$(ENVIRONMENT)" },
            { "name": "Status", "value": "$(Agent.JobStatus)" },
            { "name": "Triggered by", "value": "$(Build.RequestedFor)" }
          ]
        }],
        "potentialAction": [{
          "@type": "OpenUri",
          "name": "View Pipeline",
          "targets": [{
            "os": "default",
            "uri": "$(System.CollectionUri)$(System.TeamProject)/_build/results?buildId=$(Build.BuildId)"
          }]
        }]
      }
```

**Rule:** Only notify on failures and production deployments. Alert fatigue kills response times.

---

## Pattern 6: Caching for Speed

Builds that take 15 minutes can take 3 minutes with proper caching.

### Docker Layer Caching

```yaml
# GitHub Actions
- name: Build and push
  uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: myregistry.azurecr.io/myapp:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Dependency Caching

```yaml
# Azure DevOps
- task: Cache@2
  inputs:
    key: 'nuget | "$(Agent.OS)" | **/packages.lock.json'
    path: '$(NUGET_PACKAGES)'
    restoreKeys: |
      nuget | "$(Agent.OS)"
  displayName: 'Cache NuGet packages'
```

### Pipeline Execution Time (Real Data)

```
Before caching:
├── Docker build: 8 min  → 2 min (layer cache)
├── NuGet restore: 3 min → 15 sec (package cache)
├── npm install:   4 min → 30 sec (node_modules cache)
└── Total:        15 min → 3 min  (80% faster ⚡)
```

---

## The Pipeline Maturity Model

Where is your team?

| Level | Description | Signs |
|-------|-------------|-------|
| **1. Manual** | "Deploy by SSHing into the server" | No pipeline exists |
| **2. Basic** | "We have a pipeline that builds and deploys" | No tests, no gates |
| **3. Standard** | "We have tests and environments" | Manual promotions, no security scan |
| **4. Advanced** | "Templates, security gates, auto-promotion" | Where you should aim |
| **5. Elite** | "Trunk-based dev, deploy on every commit" | Feature flags, canary releases |

Most teams are at Level 2-3. Getting to Level 4 takes **3-6 months of focused effort** but transforms your delivery speed.

---

The best pipeline is one your team **actually wants to use**. Make it fast, make it reliable, make it reusable. Everything else follows.

---

*Have pipeline patterns that work for your team? Share them in the comments. Follow for more battle-tested DevOps content.*
