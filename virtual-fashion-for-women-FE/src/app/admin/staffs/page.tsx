"use client";

import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, Table, Select } from "antd";
import { api } from "@/api/instance";
import { PaginationDTO } from "@/models/PaginationDTO";
import { ListFilter, User } from "lucide-react";
import { messageToast } from "@/helpers/toastHelper";

export default function StaffsPage() {
   const [open, setOpen] = useState(false);
   const [isActive, setIsActive] = useState(null);
   const [pagination, setPagination] = useState<PaginationDTO>({
      CurrentPage: 1,
      HasNext: false,
      HasPrevious: false,
      PageSize: 10,
      TotalCount: 0,
      TotalPages: 0,
   });
   const [staffs, setStaffs] = useState([]);

   const [form] = Form.useForm();

   const columns = [
      { title: "ID", dataIndex: "userId", key: "userId", width: 70 },
      { title: "Tên", dataIndex: "fullName", key: "fullName" },
      { title: "Email", dataIndex: "email", key: "email" },
      { title: "Vai trò", dataIndex: "roleName", key: "roleName" },
      { title: "Trạng thái", dataIndex: "isActive", key: "isActive", render: (isActive: boolean) => (isActive ? "Hoạt động" : "Không hoạt động") },
      {
         title: "Hành động",
         key: "action",
         render: (_, record) => (
            <Button
               type={record.isActive ? "default" : "primary"}
               danger={record.isActive}
               onClick={() => toggleActiveStatus(record.userId, record.isActive)}
            >
               {record.isActive ? "Vô hiệu" : "Kích hoạt"}
            </Button>
         )
      }
   ];

   const toggleActiveStatus = async (userId: number) => {
      try {
         const response = await api.put(`register/staff/${userId}`);

         if (response.status === 200) {
            fetchStaffs();
            messageToast.success("Thao tác thành công.");
         }
      } catch (error) {
         console.error("Error toggling staff status", error);
         messageToast.error("Thao tác thất bại.");
      }
   };

   const handleCreateStaff = async () => {
      try {
         const values = await form.validateFields();

         const payload = {
            fullName: values.name,
            email: values.email,
            password: values.password,
            confirmPassword: values.confirmPassword,
         };

         const response = await api.post('register/staff', payload);
         if (response.status === 200) {
            setOpen(false);
            fetchStaffs();
            form.resetFields();
            messageToast.success("Tạo nhân viên thành công.");
         }

      } catch (error) {
         console.error("Error creating staff", error);
         messageToast.error("Tạo nhân viên thất bại.");
      }
   };

   const handlePageChange = (page: any) => {
      setPagination((prev) => ({ ...prev, CurrentPage: page }));
   };

   const fetchStaffs = async () => {
      try {
         const response = await api.get("/user/staffs", {
            params: { PageIndex: pagination.CurrentPage, PageSize: pagination.PageSize, isActive: isActive },
         });
         if (response.status === 200) {
            setStaffs(response.data.data);
            setPagination((prev) => ({
               ...prev,
               TotalCount: response.data.pagination.TotalCount,
               TotalPages: response.data.pagination.TotalPages,
               PageSize: response.data.pagination.PageSize,
            }));
         }
      } catch (error) {
         setStaffs([]);
         console.error("Error fetching staffs", error);
      }
   }

   useEffect(() => {
      fetchStaffs();
   }, [isActive, pagination.CurrentPage]);

   return (
      <div className="p-8 bg-gray-50 min-h-screen">
         {/* Header */}
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold">Quản lý nhân viên</h1>
            <button
                        onClick={() => setOpen(true)}
                        className="bg-blue-600 flex gap-2 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors cursor-pointer items-center"

                    >
                        <User className="w-4 h-4" />
                        Tạo nhân viên
                    </button>
         </div>

         <div className="flex gap-3 items-center">
            <ListFilter />
            <Select
               value={isActive}
               onChange={(e) => setIsActive(e)}
               style={{ width: 150 }}
               options={[
                  { value: null, label: "Tất cả" },
                  { value: true, label: "Hoạt động" },
                  { value: false, label: "Không hoạt động" },
               ]}
            />
         </div>


         {/* Table */}
         <div className="bg-white p-4 rounded-xl mt-3">
            <Table
               columns={columns}
               dataSource={staffs}
               rowKey="userId"
               pagination={{
                  current: pagination.CurrentPage,
                  pageSize: pagination.PageSize,
                  total: pagination.TotalCount,
                  onChange: handlePageChange,
               }}
            />
         </div>

         {/* Create Staff Modal */}
         <Modal
            title={<span className="text-xl">Tạo nhân viên</span>}
            open={open}
            onCancel={() => { setOpen(false); form.resetFields(); }}
            onOk={handleCreateStaff}
            okText="Tạo"
            cancelText="Huỷ"
         >
            <Form layout="vertical" form={form}>
               <Form.Item
                  label={<span>Tên nhân viên</span>}
                  name="name"
                  rules={[{ required: true, message: "Vui lòng nhập tên nhân viên" }]}
               >
                  <Input placeholder="Nhập tên đầy đủ" />
               </Form.Item>

               <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                     { required: true, message: "Vui lòng nhập email" },
                     { type: "email", message: "Email không hợp lệ" },
                  ]}
               >
                  <Input placeholder="Nhập email" />
               </Form.Item>

               <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                     { required: true, message: "Vui lòng nhập mật khẩu" },
                     { min: 6, message: "Mật khẩu phải ít nhất 6 ký tự" }
                  ]}
               >
                  <Input.Password placeholder="Nhập mật khẩu" />
               </Form.Item>

               <Form.Item
                  label="Nhập lại mật khẩu"
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                     { required: true, message: "Vui lòng nhập lại mật khẩu" },
                     ({ getFieldValue }) => ({
                        validator(_, value) {
                           if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                           }
                           return Promise.reject(new Error("Mật khẩu không trùng khớp"));
                        },
                     }),
                  ]}
               >
                  <Input.Password placeholder="Nhập lại mật khẩu" />
               </Form.Item>

            </Form>
         </Modal>
      </div>
   );
}
