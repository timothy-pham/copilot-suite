# copilot-master-provisioner

CLI bootstrap để tạo cấu hình GitHub Copilot theo từng project trong một lần chạy:

- `.github/copilot-instructions.md`
- `.github/skills/*`
- file prompt tùy chọn để nhờ agent đọc codebase và cải tiến lại instructions đã sinh

## Điểm Mới

Luồng `autopilot` hiện tại:

- hỏi chọn `English` hoặc `Tiếng Việt` ngay từ đầu
- discover skills từ 2 nguồn official:
  - [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main)
  - [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills)
- hỏi cài starter pack gợi ý trước khi hiển thị toàn bộ catalog skills
- cài skills vào `.github/skills`, đúng layout project skills hiện tại của GitHub Copilot
- ghi sẵn prompt tiếp theo vào `.github/copilot-instructions.improve.prompt.md` và có thể copy prompt này vào clipboard ở chế độ interactive

Starter pack gợi ý mặc định hiện gồm:

- `architecture-blueprint-generator`
- `add-educational-comments`
- `agentic-eval`

## Cách Chạy Nhanh

Cài global:

```bash
npm install -g git+ssh://git@github.com:timothy-pham/copilot-suite.git
autopilot --project /path/to/your/project
```

Cài local:

```bash
npm install git+ssh://git@github.com:timothy-pham/copilot-suite.git
npx copilot-master-provisioner --project /path/to/your/project
```

Chạy trực tiếp trong repo:

```bash
./bin/autopilot --project /path/to/your/project
```

Hoặc dùng script hỗ trợ:

```bash
./setup.sh --project /path/to/your/project
```

## Trình Tự Interactive

`autopilot` sẽ đi theo thứ tự:

1. Hỏi chọn ngôn ngữ.
2. Detect stack và tín hiệu kiến trúc.
3. Đồng bộ 2 nguồn skill official.
4. Hỏi cài starter pack.
5. Hiển thị danh sách skills discover được để chọn cài thêm.
6. Cập nhật VS Code settings nếu không bị bỏ qua.
7. Sinh `.github/copilot-instructions.md`.
8. Gợi ý prompt sẵn để agent đọc codebase và cải tiến `copilot-instructions.md`.

Ở chế độ `--non-interactive`, CLI sẽ:

- dùng `--lang` nếu có, nếu không sẽ lấy theo locale của hệ điều hành
- tự cài starter pack mặc định
- bỏ qua bước chọn thêm skills
- vẫn ghi file prompt cải tiến instructions

## Tùy Chọn CLI

```bash
autopilot --help
```

Các flag thường dùng:

- `--project <path>`: đường dẫn project đích.
- `--lang <en|vi>`: chọn ngôn ngữ cho CLI và file instructions sinh ra.
- `--skills-repo <url>`: thêm một repo skills ngoài 2 nguồn official. Có thể lặp lại flag này nhiều lần.
- `--skip-skills`: bỏ qua bước discover và cài skills.
- `--skip-vscode`: bỏ qua bước cập nhật VS Code settings.
- `--state-path <path>`: đổi vị trí file checkpoint.
- `--restart`: bỏ trạng thái cũ và chạy lại từ đầu.
- `--resume`: tiếp tục từ checkpoint trước.
- `--non-interactive`: chạy với mặc định và tự cài starter pack.

## Kết Quả Sau Khi Chạy

Sau khi chạy thành công, project đích sẽ có:

- `.github/copilot-instructions.md`
- `.github/copilot-instructions.improve.prompt.md`
- `.github/skills/<source>--<skill>/...`

## Ghi Chú

- Cần Node.js `>=18` và `git` để đồng bộ skills đầy đủ.
- Việc discover skills dựa trên các thư mục có `SKILL.md` trong repo nguồn.
- `copilot-instructions.md` sinh ra là điểm khởi đầu có cấu trúc; prompt follow-up dùng để tinh chỉnh sát với codebase thật.
- Bản tiếng Anh nằm ở [README.md](./README.md).
