# copilot-suite

`copilot-suite` là CLI bootstrap giúp thiết lập hướng dẫn GitHub Copilot (instructions, skills) theo từng project trong một lần chạy.

Sau khi chạy `autopilot`, project có thể nhận được:

- `.github/copilot-instructions.md`
- `.github/skills/*`
- `.github/copilot-instructions.improve.prompt.md`

## Tổng Quan

Lệnh `autopilot` dẫn người dùng qua một luồng cài đặt gọn và thực dụng:

- chọn `English` hoặc `Tiếng Việt`
- nhận diện stack và tín hiệu kiến trúc của project
- discover skills từ các repo official
- gợi ý cài starter pack trước
- cho phép chọn cài thêm skills từ catalog discover được
- sinh `copilot-instructions.md` cho project
- lưu sẵn prompt để có thể dán vào Copilot Chat và nhờ Agent tinh chỉnh instructions theo codebase thật

Các nguồn skill official đang được sử dụng:

- [github/awesome-copilot](https://github.com/github/awesome-copilot/tree/main)
- [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills)

## Starter Pack Khuyến Nghị

Starter pack mặc định gồm:

- `architecture-blueprint-generator`
- `add-educational-comments`
- `agentic-eval`

Bộ này đóng vai trò nền tảng ban đầu trước khi người dùng duyệt toàn bộ danh sách skills discover được.

## Cách Chạy Nhanh

Cài global:

```bash
npm install -g git+ssh://git@github.com:timothy-pham/copilot-suite.git
autopilot --project /path/to/your/project
```

Cài local:

```bash
npm install git+ssh://git@github.com:timothy-pham/copilot-suite.git
npx copilot-suite --project /path/to/your/project
```

Chạy trực tiếp trong repository:

```bash
./bin/autopilot --project /path/to/your/project
```

Hoặc dùng script hỗ trợ:

```bash
./setup.sh --project /path/to/your/project
```

## Luồng Interactive

Trong chế độ interactive, `autopilot` sẽ:

1. Hỏi người dùng chọn ngôn ngữ.
2. Khảo sát project để nhận diện stack và dấu hiệu kiến trúc.
3. Đồng bộ các nguồn skill official.
4. Gợi ý cài starter pack khuyến nghị.
5. Hiển thị catalog skills để người dùng chọn cài thêm nếu cần.
6. Sinh `.github/copilot-instructions.md`.
7. Lưu `.github/copilot-instructions.improve.prompt.md` và có thể copy nội dung vào clipboard nếu người dùng muốn.

Ở chế độ `--non-interactive`, CLI sẽ:

- dùng `--lang` nếu có, nếu không thì lấy theo locale của hệ điều hành
- tự cài starter pack khuyến nghị
- bỏ qua bước chọn thêm skills
- vẫn ghi file prompt để tinh chỉnh instructions

## Tùy Chọn CLI

```bash
autopilot --help
```

Các flag thường dùng:

- `--project <path>`: đường dẫn project đích.
- `--lang <en|vi>`: chọn ngôn ngữ cho CLI và file instructions được sinh ra.
- `--skills-repo <url>`: thêm một repo skills ngoài các nguồn official. Có thể lặp lại flag này nhiều lần.
- `--skip-skills`: bỏ qua bước discover và cài skills từ remote.
- `--state-path <path>`: đổi vị trí file checkpoint.
- `--restart`: bỏ trạng thái cũ và chạy lại từ đầu.
- `--resume`: tiếp tục từ checkpoint trước.
- `--non-interactive`: chạy với mặc định và tự cài starter pack.

## Kết Quả Sinh Ra

Sau khi chạy thành công, project đích sẽ có:

- `.github/copilot-instructions.md`
- `.github/copilot-instructions.improve.prompt.md`
- `.github/skills/<source>--<skill>/...`

## Yêu Cầu

- Node.js `>=18`
- `git` để đồng bộ các repo skill official

## Ghi Chú

- Việc discover skills dựa trên các thư mục có `SKILL.md` trong từng repo nguồn.
- `copilot-instructions.md` được sinh ra như một điểm khởi đầu tốt, không phải bản audit hoàn chỉnh của codebase.
- Prompt tinh chỉnh đi kèm giúp Agent điều chỉnh instructions cho sát với repository thực tế sau bước bootstrap ban đầu.
- Bản tiếng Anh nằm ở [README.md](./README.md).
