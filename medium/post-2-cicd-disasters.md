# 5 CI/CD Pipeline Disasters I Caused (And How I Fixed Them)

*A confession from a Senior DevOps Engineer who has broken production more times than he'd like to admit*

---

Nobody writes post-mortems about CI/CD pipelines.

When a database goes down, there's a war room, a Slack channel, and a 12-page incident report. When a CI/CD pipeline silently deploys a broken build to production at 3 AM on a Saturday — nobody writes about that.

I'm going to write about that. Because in five years of building deployment pipelines for enterprise teams, I've caused more production incidents through pipeline misconfigurations than through any other single category of mistake.

These are my five worst pipeline disasters, exactly how they happened, and the engineering changes we made so they could never happen again.

---

## Disaster #1: The Pipeline That Deployed on Every Commit to Main

**The setup:** We had just migrated from Jenkins to Azure DevOps. The new pipeline was beautiful — multi-stage, with build, test, and deploy stages. I was proud of it.

**The trigger configuration:**

```yaml
trigger:
  branches:
    include:
      - main
```

Simple. Clean. Every commit to main triggers the pipeline. Ship fast, right?

**What happened:** A developer merged a PR at 4:47 PM on a Friday. The PR had passed code review. It had passed unit tests. It looked fine.

But the developer had also updated a `README.md` file in the same PR. The pipeline triggered. It built, tested, and deployed — all automatically. No approval gate. No human checkpoint. Straight to production.

The code change was fine. But the deployment happened during a database migration that was running in production. The new code expected a column that didn't exist yet. Instant 500 errors across the entire API.

**The fix:**

```yaml
# Never auto-deploy to production. Never.
stages:
  - stage: Build
    # Auto-trigger on main ✅

  - stage: DeployStaging
    dependsOn: Build
    # Auto-deploy to staging ✅

  - stage: DeployProduction
    dependsOn: DeployStaging
    condition: succeeded()
    jobs:
      - deployment: Production
        environment: 'production'  # ← Manual approval gate
        strategy:
          runOnce:
            deploy:
              steps:
                - script: echo "Deploying to production"
```

**The rule established:** Build and deploy to staging automatically. Production deployments **always** require manual approval. Always. No exceptions. Not for hotfixes. Not for "just a config change." Not for anything.

**Environment approval configuration:**
1. Azure DevOps → Environments → Production → Approvals and checks
2. Add approval gate with 2 required approvers
3. Add business hours check (no deploys Friday 4 PM to Monday 8 AM)
4. Add branch control (only `main` branch)

**Time to detect:** 23 minutes
**Time to resolve:** 4 minutes (rollback)
**Users affected:** ~2,000

---

## Disaster #2: The Secret That Wasn't Secret

**The setup:** We needed to pass a database connection string to our deployment pipeline. I did what any reasonable engineer would do: I stored it as a pipeline variable.

**What I did wrong:** I forgot to check the "Keep this value secret" checkbox.

Which means the connection string — containing the database hostname, port, username, and password — was visible in plain text in the pipeline logs. For every single run. For three months.

```
# What appeared in every pipeline log for 90 days:
Step 4/12: Setting environment variables
  DATABASE_URL=postgresql://admin:P@ssw0rd2024!@prod-db.postgres.database.azure.com:5432/maindb
  REDIS_URL=redis://:RedisP@ss!@prod-redis.redis.cache.windows.net:6380
```

Anyone with read access to the pipeline — which was the entire engineering team of 40 people — could see production database credentials in every build log.

**How we found it:** A new hire asked, "Hey, should this password be visible in the logs?" Bless that new hire.

**The fix (multi-layered):**

```yaml
# Layer 1: Azure DevOps secret variables (masked in logs)
variables:
  - group: production-secrets  # Linked to Azure Key Vault

# Layer 2: Pipeline step to verify no secrets in output
- script: |
    # Scan pipeline logs for potential secrets
    if grep -rE "(password|secret|key|token|connectionstring)=" $(Pipeline.Workspace)/logs/; then
      echo "##vso[task.logissue type=error]Potential secret found in logs!"
      exit 1
    fi
  displayName: 'Secret Scan'

# Layer 3: Azure Key Vault integration (source of truth)
- task: AzureKeyVault@2
  inputs:
    azureSubscription: 'production-connection'
    KeyVaultName: 'kv-prod-app'
    SecretsFilter: 'database-url,redis-url,api-key'
```

**The rule established:**
1. **No secrets in pipeline variables.** All secrets come from Azure Key Vault.
2. **Secret scanning** in every pipeline run using GitLeaks or similar.
3. **Quarterly audit** of all pipeline variables across all projects.
4. **Rotate all credentials immediately** if exposure is discovered.

We rotated every credential that had ever appeared in those logs. Every. Single. One.

**Time to detect:** 90 days (that's the scary part)
**Credentials rotated:** 14
**Sleep lost:** Significant

---

## Disaster #3: The Cache That Poisoned Every Build

**The setup:** Our Node.js builds were taking 12 minutes because `npm install` downloaded 1,200 packages every time. So I added caching:

```yaml
- task: Cache@2
  inputs:
    key: 'npm | "$(Agent.OS)" | package-lock.json'
    path: $(npm_config_cache)
    restoreKeys: |
      npm | "$(Agent.OS)"
  displayName: 'Cache npm packages'
```

Build time dropped from 12 minutes to 3 minutes. I was a hero.

For exactly two weeks.

**What happened:** A developer updated a package to fix a critical security vulnerability. They ran `npm update`, updated `package.json`, but the `package-lock.json` didn't properly reflect the transitive dependency change.

The cache key was based on `package-lock.json`. The lock file barely changed. So the cache hit. And the old, *vulnerable* version of the package was restored from cache instead of the new, patched version.

The "fixed" version deployed to production with the unfixed vulnerability. For nine days.

**How we found it:** A security scan in a different pipeline caught the vulnerable dependency. But only because that pipeline *didn't* have caching enabled.

**The fix:**

```yaml
# Better cache strategy with integrity verification
- task: Cache@2
  inputs:
    key: 'npm | "$(Agent.OS)" | package-lock.json | $(Build.SourceVersion)'
    path: $(npm_config_cache)
    restoreKeys: |
      npm | "$(Agent.OS)" | package-lock.json
  displayName: 'Cache npm packages'

# ALWAYS verify after cache restore
- script: |
    npm ci  # Clean install — ignores cache if lock file changed
    npm audit --audit-level=high  # Fail if high/critical vulns
  displayName: 'Install & Audit'
```

The key change: using `npm ci` instead of `npm install`. `npm ci` deletes `node_modules` and installs fresh from the lock file — it uses the download cache but doesn't trust stale installed packages.

**The rule established:**
1. **Cache downloads, not installations.** Cache the npm/pip download cache, not the `node_modules` or `.venv` directory itself.
2. **Always run security audit** after dependency installation, regardless of cache.
3. **Include the commit SHA** in the cache key for critical pipelines.

---

## Disaster #4: The Infinite Loop Deploy

**The setup:** We had a GitOps pipeline where pushing a new image tag to the config repository triggered a deployment. ArgoCD would detect the change and sync.

We also had a pipeline that ran *after* deployment to update a status badge in the same config repository.

You see where this is going.

```
1. Developer pushes code
2. CI pipeline builds image, pushes to registry
3. CI pipeline updates image tag in config repo  ← triggers ArgoCD
4. ArgoCD deploys new version
5. Post-deploy pipeline updates status badge in config repo ← triggers step 3
6. Step 3 triggers ArgoCD again...
7. ArgoCD deploys the same version...
8. Post-deploy pipeline updates status badge...
9. GOTO 5
```

Infinite deployment loop.

It ran 47 times in 3 hours before someone noticed. Forty-seven deployments of the *same version*. Each one triggering pod restarts, health check failures, and brief service disruptions.

The monitoring dashboard looked like a heart rate monitor during a panic attack.

**The fix:**

```yaml
# In the badge-update pipeline:
- script: |
    # Check if the image tag actually changed
    CURRENT_TAG=$(grep 'image:' k8s/deployment.yaml | awk -F: '{print $NF}')
    if [ "$CURRENT_TAG" == "$NEW_TAG" ]; then
      echo "Image tag unchanged. Skipping commit."
      exit 0
    fi
    
    # Use [skip ci] in commit message
    git commit -m "chore: update status badge [skip ci]"
    git push
  displayName: 'Update badge (skip CI trigger)'
```

**The rules established:**
1. **Any commit to the config repo that isn't a deployment must include `[skip ci]`** in the commit message.
2. **Idempotency checks** before every git push in pipelines — don't push if nothing meaningful changed.
3. **Circuit breaker:** If the same pipeline runs more than 3 times in 10 minutes, automatically block further runs and alert the team.

---

## Disaster #5: The "Works on My Machine" Dockerfile

**The setup:** A developer built a Docker image locally on their M1 MacBook. The image worked perfectly in local testing. They pushed it to our Azure Container Registry.

The CI pipeline didn't build the image — it pulled the developer's pre-built image and deployed it.

**What happened:** The developer's MacBook builds `arm64` images. Our AKS nodes run `amd64`.

```
Error: exec format error
```

Every single pod crashed. CrashLoopBackOff across 12 services. On a Monday morning.

The irony: the error message "exec format error" is so vague that we spent 20 minutes thinking it was a binary corruption issue before someone realized the architecture mismatch.

**The fix:**

```yaml
# ALWAYS build in the pipeline. Never use pre-built images.
- script: |
    docker buildx build \
      --platform linux/amd64 \
      --tag $(ACR_NAME).azurecr.io/$(IMAGE_NAME):$(Build.BuildId) \
      --push \
      .
  displayName: 'Build & Push (amd64 only)'
```

And a policy enforcement using OPA/Gatekeeper:

```yaml
# Reject any image not built by our CI pipeline
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sAllowedRepos
metadata:
  name: require-acr-images
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    namespaces: ["production"]
  parameters:
    repos:
      - "prodacr.azurecr.io/"  # Only allow images from our ACR
```

```yaml
# Image provenance - verify build pipeline metadata
# We tag every CI-built image with build metadata
- script: |
    docker buildx build \
      --label "built-by=azure-devops" \
      --label "pipeline=$(Build.DefinitionName)" \
      --label "build-id=$(Build.BuildId)" \
      --label "commit=$(Build.SourceVersion)" \
      --platform linux/amd64 \
      --tag $(ACR_NAME).azurecr.io/$(IMAGE_NAME):$(Build.BuildId) \
      --push \
      .
```

**The rules established:**
1. **Never deploy locally-built images.** All production images must be built by the CI pipeline.
2. **Always specify `--platform linux/amd64`** in Docker builds.
3. **Label every image** with build metadata for traceability.
4. **OPA policy** rejecting images not from approved registries.

---

## What I Learned

Five disasters. Five 2-AM wake-up calls. Five post-mortems that started with "how did we let this happen?"

Here's what I took away:

**1. Pipelines are infrastructure.** They deserve the same rigor as your Kubernetes manifests, Terraform modules, and application code. Code review them. Test them. Version them.

**2. Every pipeline needs a circuit breaker.** A mechanism that says "something is wrong, stop deploying" before a human notices. Whether it's deployment frequency limits, health check gates, or automatic rollback triggers.

**3. Secrets in pipelines are the #1 security risk** most teams ignore. Not because they don't care, but because it's invisible. You don't see the password in the logs until someone goes looking.

**4. Caches are assumptions.** And assumptions expire. Always verify after a cache restore. Trust, but verify. Actually — don't trust. Just verify.

**5. The scariest incidents aren't the ones that cause an outage. They're the ones you don't notice for 90 days.** A secret exposed in logs for three months. A vulnerable dependency cached for nine days. A deployment loop running 47 times. Silent failures are worse than loud ones.

---

If you're building CI/CD pipelines, learn from my mistakes. If you've already made these mistakes, welcome to the club.

We don't have t-shirts, but we have excellent post-mortems.

---

*If you've survived your own pipeline disaster, I want to hear about it. Drop a comment — anonymized, of course. Your secrets are safe with me (unlike my pipeline variables).*

*Follow for more real-world DevOps war stories. I write about the things we break so you don't have to.*
