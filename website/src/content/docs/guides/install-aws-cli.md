---
title: Installing the AWS CLI (all platforms)
description: Official AWS CLI v2 installers for macOS, Linux and Windows — no pip, no Homebrew surprises.
---

Official reference: <https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>

This project uses **AWS CLI v2**. All methods below are the official AWS installers — standalone binaries (bundled Python), no pip, no Homebrew, no system dependencies.

---

## macOS

### Install script (recommended, current user, no sudo)

```sh
curl -fsSL https://awscli.amazonaws.com/v2/install.sh | bash
```

Installs to `~/.local/share/aws-cli` and symlinks the binary at `~/.local/bin/aws` (ensure `~/.local/bin` is on your `PATH`).

### GUI installer

Download and run <https://awscli.amazonaws.com/AWSCLIV2.pkg>, follow the wizard. Default install: `/usr/local/aws-cli` + symlink at `/usr/local/bin/aws` (requires admin).

### Command line, all users (requires sudo)

```sh
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

> Avoid `brew install awscli`: it is a third-party build and has had runtime breakages on recent macOS versions (e.g. pyexpat/libexpat symbol crashes).

## Linux

### Install script (recommended, current user, no sudo)

```sh
curl -fsSL https://awscli.amazonaws.com/v2/install.sh | bash
```

Same layout as macOS: `~/.local/share/aws-cli`, symlink in `~/.local/bin`. For a system-wide install instead: `curl -fsSL https://awscli.amazonaws.com/v2/install.sh | sudo bash -s -- --system`

### Command line installer (x86_64 / arm64)

```sh
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"   # arm64: awscli-exe-linux-aarch64.zip
unzip awscliv2.zip
sudo ./aws/install
```

Without sudo: `./aws/install -i ~/.local/aws-cli -b ~/.local/bin`

Optional GPG signature verification steps are described in the [official docs](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

### Snap

```sh
snap install aws-cli --classic
```

## Windows (PowerShell)

### Install script (recommended)

```powershell
irm https://awscli.amazonaws.com/v2/install.ps1 | iex
```

### MSI installers

- Current user (no admin): <https://awscli.amazonaws.com/AWSCLIV2-User.msi>
- All users (admin): <https://awscli.amazonaws.com/AWSCLIV2.msi> — or silently:

```powershell
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi /qn
```

## Verify

```sh
aws --version
# e.g. aws-cli/2.37.9 Python/3.14.6 Darwin/25.2.0 script-exe/arm64
```

If `aws` is not found, restart your terminal (PATH refresh).

## Update / uninstall

```sh
aws update          # works for installs made via script/official installer
```

Uninstall instructions: <https://docs.aws.amazon.com/cli/latest/userguide/uninstall.html>

---

## Next step: point it at LocalStack

No extra tooling needed — the AWS CLI supports LocalStack through a plain profile (`--endpoint-url` in `~/.aws/config`). See the official guide: <https://docs.localstack.cloud/aws/connecting/aws-cli/#configuring-a-custom-profile> — or in this repo, just run:

```sh
make setup-cli      # writes the 'localstack' profile into ~/.aws
aws --profile localstack s3 ls
```

> Note: the old `awslocal` wrapper script (installed via pip) is **deprecated** by LocalStack in favor of the profile approach above.
