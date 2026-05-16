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
      name: Yup.string().required("Full Name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      role: Yup.string()
        .oneOf(["patient", "doctor"], "Invalid role selected")
        .required("Account type is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const toastId = toast.loading("Creating account...");

      try {
        const data = await registerApi(values);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success(data.message || "Registration successful", {
          id: toastId,
        });

        // Dynamic redirect based on the registered role
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
            "Registration failed",
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
          Create Account
        </h2>

        <p className="text-center text-gray-500 mb-8">
          Create your healthcare account
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Full Name Field */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
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

          {/* Email Field */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
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

          {/* Password Field */}
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
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

          {/* Role Selection Field */}
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
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
            {formik.touched.role && formik.errors.role ? (
              <div className="text-red-500 text-sm mt-1">
                {formik.errors.role}
              </div>
            ) : null}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer disabled:bg-blue-300"
          >
            {formik.isSubmitting ? "Creating..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}