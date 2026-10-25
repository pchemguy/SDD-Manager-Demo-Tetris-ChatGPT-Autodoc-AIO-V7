# Prepare and recover a Playwright environment

Load before selected Playwright-dependent execution, or when its installation, provisioning or browser runtime blocks required checks. Follow the project's browser, source/trust, isolation and security policies and declared coverage; this module selects no browsers, frameworks or supported platforms for the project. Examples illustrate configuration, not defaults overriding project documents.

- [Preflight and normal setup](#preflight-and-normal-setup)
- [Chromium mode](#chromium-mode)
- [Download diagnostics and recovery](#download-diagnostics-and-recovery)
- [Official image fallback](#official-image-fallback)
- [Firefox content-process recovery](#firefox-content-process-recovery)
- [Execution checks and evidence](#execution-checks-and-evidence)

## Preflight and normal setup

Proactively establish provisioning and representative execution before dependent browser work; do not wait for the user to diagnose failures. Use the project's installed package/CLI and lockfile to identify the runner version and matching managed browser revisions. Record the execution host's OS/architecture and required modes. Do not install an unpinned runner or change versions merely to retry a download.

Set `PLAYWRIGHT_BROWSERS_PATH` to one absolute, dedicated directory for installation and every automation process, following the host's shell policy. The default per-user cache alone does not establish ownership. Inspect compatible contained assets before downloading again. For a Node project with the usual installed `playwright` dependency, the following commands use its local CLI; resolve the actual installed CLI if its layout differs:

```text
node node_modules/playwright/cli.js --version
node node_modules/playwright/cli.js install --dry-run chromium firefox
node node_modules/playwright/cli.js install --only-shell chromium firefox
```

These are illustrative commands for a project requiring Chromium and Firefox; substitute the selected browser targets. Run each command separately or from a temporary shell file with prerequisite failure handling. Omit `--only-shell` when full Chromium is required. Check options against the installed version. Name selected browsers explicitly; avoid an unqualified all-browser install. Firefox requires Playwright's managed patched build, not stock Firefox. Provision host dependencies only within the authorized setup scope.

## Chromium mode

When Playwright's **Chromium headless shell** meets the selected application execution, UI interaction, Canvas rendering and screenshot requirements, use it without requiring a desktop GUI. Use `browserName: 'chromium'`, `headless: true` and no `channel` or custom executable override:

```javascript
{ name: 'chromium', use: { browserName: 'chromium', headless: true } }
```

`channel: 'chromium'` selects full Chromium's headless mode; full Chromium and headed execution are separate choices. Require those modes only when project criteria need them, such as desktop-window behavior or a capability absent from the shell. If full Chromium fails a host-denied socket operation, test the shell when it meets the accepted scope; retain explicitly required full/headed coverage as blocked until a compatible facility is available. Report the effective executable/mode from launch logs, not merely the project label or an executable-path API that may describe another mode.

For a documented branded-browser requirement with contained provisioning, do not use `playwright install chrome` or another global browser installer: `PLAYWRIGHT_BROWSERS_PATH` does not relocate branded Chrome/Edge installations. Select a route that satisfies the project's isolation policy.

## Download diagnostics and recovery

Diagnose each required browser independently; an installer stopping at Chromium says nothing about Firefox. Use the installed runner's dry-run URLs/revisions, a finite request deadline and bounded GET response sampling. Retain the command, sanitized requested/final URL and redirects, status, content type, received size and archive signature/error excerpt. Never log credentials or signed URL secrets. HEAD or HTTP success alone is insufficient; validate the complete downloaded archive before use.

| Observation | Next action |
| --- | --- |
| HTTP 200 with HTML, or HTTP 503 | Inspect the bounded body and proxy/gateway evidence; test the official fallbacks. Distinguish failure through this network path from an upstream-wide outage. |
| TLS error, timeout or interrupted transfer | Check configured proxy/CA, deadline and transfer evidence. Apply the supported correction; never disable certificate verification. Retry only with a transient-failure basis or changed condition. |
| Valid archive, failed extraction or missing binary | Check integrity, disk space, extraction path/permissions and runner revision before downloading again. |
| Installation lock | Establish the lock's owner and whether an installer remains active. Remove only an owned stale lock; never clear another process's lock or cache. |

If the normal route fails, proactively select a compatible contained installation, an official fallback/approved artifact mirror, a version-matched official container image, or an approved offline/remote environment. `PLAYWRIGHT_DOWNLOAD_HOST` and per-browser host variables support approved mirrors; they must expose the paths required by the installed runner. Do not guess mirrors, weaken TLS or evade network controls. A failed CDN does not establish that the official image registry is unavailable.

## Official image fallback

Use Microsoft's `mcr.microsoft.com/playwright:v<runner-version>-<supported-distribution>` image when compatible with the host and required architecture; replace placeholders from the actual runner and published image metadata. Prefer running the image through an available authorized container runtime. The image supplies browsers and OS dependencies; the matching project Playwright package is still required.

When a container runtime is unavailable, selective extraction of official image browser files is an eligible fallback:

1. Use a fresh owned temporary directory and check disk space. Request `https://mcr.microsoft.com/v2/playwright/manifests/<tag>` with Docker/OCI manifest and index Accept types. Resolve the required OS/architecture descriptor; fetch its manifest by digest rather than assuming the tag is a single-platform image.
2. Fetch the manifest's config and needed layer blobs through `/v2/playwright/blobs/<digest>`. Inspect config/history and archive entries to locate the browser paths, normally `/ms-playwright`. Do not assume the final layer contains them. Record the selected image/platform digest; verify manifest/config/layer SHA-256 and declared sizes before extraction. Keep TLS verification enabled.
3. Process relevant layers in order, honoring replacements and whiteout deletions. Extract only required managed-browser directories, including the selected Chromium shell/full build and required auxiliaries such as FFmpeg. Reject traversal, escaping links and device entries; preserve executable modes and safe internal links. Use a trusted OCI extractor if manual handling cannot establish these guarantees.
4. Point `PLAYWRIGHT_BROWSERS_PATH` at the extracted browser root, preserving managed directory names. Confirm required revisions against the installed runner. Extraction supplies no container isolation or OS dependencies: check host ABI/libraries separately, accounting for bundled library resolution, and use a compatible environment if necessary.
5. Run the execution checks below before retaining the installation. Record source/digests, extraction method, destination, versions and limitations. Do not commit binaries or bake this session's version/digest into general defaults.

## Firefox content-process recovery

Separate browser launch from context/page creation. When Firefox starts but page creation hangs or child processes crash with namespace/sandbox permission errors such as `/proc/self/uid_map: EPERM`, inspect browser logs and host dependencies first. For trusted local application tests in a dedicated execution environment, test this process-local override without changing host restrictions:

```javascript
const browser = await firefox.launch({
    headless: true,
    timeout: 10_000,
    env: { ...process.env, MOZ_DISABLE_CONTENT_SANDBOX: '1' },
});
```

The snippet assumes the project's imported `firefox` runner. In Playwright Test, apply the same `env` object under the Firefox project's `use.launchOptions`; gate it on the diagnosed execution environment, not every Firefox run. This disables Firefox's internal content-process sandbox and reduces browser isolation; it does not remove the host sandbox or make untrusted pages safe. Do not use it for arbitrary external content or when policy requires the internal sandbox. In those cases use an approved compatible execution environment.

Adopt the override only after repeated page/interaction/rendering/teardown checks succeed; retain its reason and scope, and re-evaluate it when the host changes. If it fails, remove the override and diagnose the actual logs rather than stacking sandbox-disable flags. Do not drop Firefox from required coverage or change host security settings as an implicit repair.

## Execution checks and evidence

Use finite launch/action/navigation timeouts **and a whole-process deadline covering page creation and cleanup**; launch timeout alone does not bound later operations. On expiry, stop only the owned process tree and confirm disposition before retrying.

For each required browser/mode, verify launch, context creation, page creation, interaction, required rendering/screenshots, at least two isolated context/page cycles, and teardown. Verify the required output through the actual application and runner; synthetic pages establish environment capability only. Keep modeled events separate from native delivery and report effective modes, outcomes and omissions in existing task evidence. Return the working remedy or concrete blocker to the active workflow; do not reduce required coverage.

Version-specific sources: [Playwright browsers](https://playwright.dev/docs/browsers), [official image/container guidance](https://playwright.dev/docs/docker), [CI setup](https://playwright.dev/docs/ci) and [Mozilla's documented content-sandbox override](https://firefox-source-docs.mozilla.org/performance/jit_profiling_with_samply.html).
