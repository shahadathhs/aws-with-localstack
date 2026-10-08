---
title: AWS CLI ইনস্টল (সব প্ল্যাটফর্ম)
description: macOS, Linux ও Windows-এর অফিসিয়াল AWS CLI v2 ইনস্টলার — pip নেই, Homebrew বিপদও নেই।
---

অফিসিয়াল রেফারেন্স: <https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html>

এই প্রজেক্টে **AWS CLI v2** ব্যবহৃত হয়। নিচের প্রতিটি পদ্ধতি অফিসিয়াল — স্ট্যান্ডঅ্যালোন বাইনারি (bundled Python), pip/Homebrew/সিস্টেম ডিপেন্ডেন্সি কিছুই লাগে না।

---

## macOS

### ইনস্টল স্ক্রিপ্ট (সুপারিশকৃত, বর্তমান ইউজার, sudo লাগে না)

```sh
curl -fsSL https://awscli.amazonaws.com/v2/install.sh | bash
```

ইনস্টল হয় `~/.local/share/aws-cli`-তে, symlink হয় `~/.local/bin/aws`-এ (`~/.local/bin` PATH-এ আছে কিনা নিশ্চিত করুন)।

### GUI ইনস্টলার

<https://awscli.amazonaws.com/AWSCLIV2.pkg> ডাউনলোড করে চালান। ডিফল্ট: `/usr/local/aws-cli` + `/usr/local/bin/aws` symlink (অ্যাডমিন লাগে)।

### কমান্ড লাইন, সব ইউজার (sudo লাগে)

```sh
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

> `brew install awscli` এড়িয়ে চলুন: এটি থার্ড-পার্টি বিল্ড এবং সাম্প্রতিক macOS-এ pyexpat/libexpat ক্র্যাশের মতো সমস্যা করেছে।

## Linux

### ইনস্টল স্ক্রিপ্ট (সুপারিশকৃত, বর্তমান ইউজার, sudo লাগে না)

```sh
curl -fsSL https://awscli.amazonaws.com/v2/install.sh | bash
```

macOS-এর মতোই: `~/.local/share/aws-cli`, symlink `~/.local/bin`-এ। সিস্টেমওয়াইড ইনস্টলে: `curl -fsSL https://awscli.amazonaws.com/v2/install.sh | sudo bash -s -- --system`

### কমান্ড লাইন ইনস্টলার (x86_64 / arm64)

```sh
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"   # arm64: awscli-exe-linux-aarch64.zip
unzip awscliv2.zip
sudo ./aws/install
```

sudo ছাড়া: `./aws/install -i ~/.local/aws-cli -b ~/.local/bin`

GPG সিগনেচার যাচাইয়ের ধাপ [অফিসিয়াল ডক](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)-এ আছে।

### Snap

```sh
snap install aws-cli --classic
```

## Windows (PowerShell)

### ইনস্টল স্ক্রিপ্ট (সুপারিশকৃত)

```powershell
irm https://awscli.amazonaws.com/v2/install.ps1 | iex
```

### MSI ইনস্টলার

- বর্তমান ইউজার (অ্যাডমিন লাগে না): <https://awscli.amazonaws.com/AWSCLIV2-User.msi>
- সব ইউজার (অ্যাডমিন): <https://awscli.amazonaws.com/AWSCLIV2.msi> — অথবা silently:

```powershell
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi /qn
```

## যাচাই

```sh
aws --version
# যেমন: aws-cli/2.37.9 Python/3.14.6 Darwin/25.2.0 script-exe/arm64
```

`aws` পাওয়া না গেলে টার্মিনাল রিস্টার্ট করুন (PATH রিফ্রেশ)।

## আপডেট / আনইনস্টল

```sh
aws update          # স্ক্রিপ্ট/অফিসিয়াল ইনস্টলার দিয়ে ইনস্টল করা হলে কাজ করে
```

আনইনস্টল নির্দেশনা: <https://docs.aws.amazon.com/cli/latest/userguide/uninstall.html>

---

## পরবর্তী ধাপ: LocalStack-এর দিকে নির্দেশ করা

কোনো অতিরিক্ত টুল লাগে না — AWS CLI একটি সাধারণ profile দিয়েই LocalStack-এ যায় (`~/.aws/config`-এ `endpoint_url`)। অফিসিয়াল গাইড: <https://docs.localstack.cloud/aws/connecting/aws-cli/#configuring-a-custom-profile> — অথবা এই রিপোতে শুধু:

```sh
make setup-cli      # ~/.aws-এ 'localstack' profile লেখে
aws --profile localstack s3 ls
```

> পুরনো `awslocal` pip wrapper LocalStack কর্তৃক **deprecated** — উপরের profile পদ্ধতিই এর বিকল্প।
