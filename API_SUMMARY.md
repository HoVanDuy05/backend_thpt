# Tổng hợp API & Middleware Phân Quyền

Tài liệu này tổng hợp toàn bộ các API trong hệ thống và quyền truy cập (Middleware) tương ứng.

## 1. Auth (Xác thực)
| Method | Endpoint | Quyền hạn (Middleware) | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | **Public** | Đăng nhập để lấy Token |

## 2. Users (Người dùng) - `UsersController`
| Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- |
| `POST` | `/users` | **Public** (`@Public`) | Đăng ký tài khoản mới |
| `POST` | `/users/teachers` | **Admin** (`@Roles`) | Tạo hồ sơ Giáo viên |
| `POST` | `/users/students` | **Admin/GiaoVien** | Tạo hồ sơ Học sinh |
| `GET` | `/users` | **Authenticated** | Xem danh sách người dùng |
| `GET` | `/users/:id` | **Authenticated** | Xem chi tiết người dùng |
| `PATCH` | `/users/:id` | **Authenticated** | Cập nhật thông tin |
| `DELETE` | `/users/:id` | **Admin** | Xóa người dùng |

## 3. Academic (Học vụ) - `AcademicController`
**Yêu cầu chung**: Chỉ **ADMIN** mới được truy cập (`@Roles(VaiTro.ADMIN)`).

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/academic/years` | Xem danh sách Năm học |
| `POST` | `/academic/years` | Tạo Năm học mới |
| `PUT` | `/academic/years/:id` | Cập nhật Năm học |
| `DELETE` | `/academic/years/:id` | Xóa Năm học |
| `GET` | `/academic/subjects` | Xem danh sách Môn học |
| `POST` | `/academic/subjects` | Tạo Môn học mới |
| `PUT` | `/academic/subjects/:id` | Cập nhật Môn học |
| `DELETE` | `/academic/subjects/:id` | Xóa Môn học |
| `GET` | `/academic/classes` | Xem danh sách Lớp học |
| `POST` | `/academic/classes` | Tạo Lớp học mới |
| `PUT` | `/academic/classes/:id` | Cập nhật Lớp học |
| `DELETE` | `/academic/classes/:id` | Xóa Lớp học |

## 4. Assessments (Khảo thí) - `AssessmentsController`
**Yêu cầu chung**: **GIAO_VIEN** hoặc **ADMIN** (`@Roles(VaiTro.GIAO_VIEN, VaiTro.ADMIN)`).

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/assessments/questions` | Xem danh sách Câu hỏi |
| `POST` | `/assessments/questions` | Tạo Câu hỏi mới |
| `PUT` | `/assessments/questions/:id` | Cập nhật Câu hỏi |
| `DELETE` | `/assessments/questions/:id` | Xóa Câu hỏi |
| `GET` | `/assessments/exams` | Xem danh sách Đề thi |
| `POST` | `/assessments/exams` | Tạo Đề thi mới |
| `GET` | `/assessments/exams/:id` | Xem chi tiết Đề thi (kèm câu hỏi) |
| `PUT` | `/assessments/exams/:id` | Cập nhật Đề thi |
| `DELETE` | `/assessments/exams/:id` | Xóa Đề thi |
| `POST` | `/assessments/exams/:id/questions` | Thêm câu hỏi vào đề |
| `DELETE` | `/assessments/exams/:id/questions/:qId` | Xóa câu hỏi khỏi đề |

## 5. Submissions (Nộp bài) - `SubmissionsController`
**Yêu cầu chung**: **Authenticated** (Đã đăng nhập).

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/submissions` | Bắt đầu làm bài (Tạo lượt nộp) |
| `GET` | `/submissions` | Xem lịch sử nộp bài của bản thân |
| `GET` | `/submissions/:id` | Xem chi tiết bài làm & đáp án |
| `POST` | `/submissions/:id/answers` | Nộp câu trả lời cho từng câu |

## 6. Grading (Chấm điểm) - `GradingController`
**Yêu cầu chung**: Chỉ **GIAO_VIEN** (`@Roles(VaiTro.GIAO_VIEN)`).

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/grading` | Chấm điểm bài làm |
| `GET` | `/grading` | Xem danh sách bài đã chấm |
| `PUT` | `/grading/:id` | Sửa điểm / Nhận xét lại |

---

### Lưu ý về Middleware
Hệ thống sử dụng **Global Guard** (`RolesGuard`) được khai báo trong `app.module.ts`. Mọi API đều tự động kiểm tra:
1.  **Token**: Phải có Header `Authorization: Bearer <token>` (trừ các API `@Public`).
2.  **Role**: Nếu Controller có `@Roles(...)`, user phải có quyền tương ứng mới được gọi.
