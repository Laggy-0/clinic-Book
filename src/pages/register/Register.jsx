import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { registerApi } from "../../api/authApi";

export default function Register() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "patient",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("الاسم الكامل مطلوب"),
      email: Yup.string()
        .email("البريد الإلكتروني غير صالح")
        .required("البريد الإلكتروني مطلوب"),
      password: Yup.string()
        .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
        .required("كلمة المرور مطلوبة"),
      role: Yup.string()
        .oneOf(["patient", "doctor"], "نوع الحساب غير صالح")
        .required("نوع الحساب مطلوب"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const toastId = toast.loading("جارٍ إنشاء الحساب...");

      try {
        const data = await registerApi(values);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success(data.message || "تم التسجيل بنجاح", {
          id: toastId,
        });

        setTimeout(() => {
          if (data.user.role === "doctor") {
            navigate("/doctor-dashboard");
          } else {
            navigate("/patient-dashboard");
          }
        }, 800);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "فشل التسجيل",
          {
            id: toastId,
          }
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="h-full flex items-center justify-center px-10">
      <div className="w-full max-w-md">
        <h2 className="text-4xl font-bold text-center text-blue-600 mb-3">
          إنشاء حساب
        </h2>

        <p className="text-center text-gray-500 mb-8">
          أنشئ حسابك في المنصة الصحية
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              name="name"
              placeholder="الاسم الكامل"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className={`w-full bg-blue-50 border px-5 py-4 rounded-xl outline-none text-lg focus:ring-2 focus:ring-blue-500 ${
                formik.touched.name && formik.errors.name
                  ? "border-red-500"
                  : "border-blue-100"
              }`}
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.name}
              </div>
            ) : null}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="البريد الإلكتروني"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`w-full bg-blue-50 border px-5 py-4 rounded-xl outline-none text-lg focus:ring-2 focus:ring-blue-500 ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : "border-blue-100"
              }`}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.email}
              </div>
            ) : null}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="كلمة المرور"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={`w-full bg-blue-50 border px-5 py-4 rounded-xl outline-none text-lg focus:ring-2 focus:ring-blue-500 ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500"
                  : "border-blue-100"
              }`}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.password}
              </div>
            ) : null}
          </div>

          <div>
            <select
              name="role"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.role}
              className={`w-full bg-blue-50 border px-5 py-4 rounded-xl outline-none text-lg focus:ring-2 focus:ring-blue-500 ${
                formik.touched.role && formik.errors.role
                  ? "border-red-500"
                  : "border-blue-100"
              }`}
            >
              <option value="patient">مريض</option>
              <option value="doctor">طبيب</option>
            </select>
            {formik.touched.role && formik.errors.role ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.role}
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer disabled:bg-blue-300"
          >
            {formik.isSubmitting ? "جارٍ الإنشاء..." : "تسجيل"}
          </button>
        </form>
      </div>
    </div>
  );
}