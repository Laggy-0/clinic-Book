import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { loginApi } from "../../api/authApi";

export default function Login() {
  const navigate = useNavigate();

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    // Yup Validation Schema
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const toastId = toast.loading("Logging in...");

      try {
        const data = await loginApi(values);

        // Save Auth state
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        toast.success(data.message || "Login successful", { id: toastId });

        // Role-based routing
        setTimeout(() => {
          if (data.user.role === "doctor") {
            navigate("/doctor-dashboard"); // Make sure to add this route to App.jsx!
          } else if (data.user.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/patient-dashboard");
          }
        }, 800);
      } catch (error) {
        toast.error(
          error.response?.data?.message || error.message || "Login failed",
          { id: toastId }
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
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Login to continue to your dashboard
        </p>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className={`w-full bg-blue-50 border px-5 py-4 rounded-xl outline-none text-lg focus:ring-2 focus:ring-blue-500 ${
                formik.touched.email && formik.errors.email ? "border-red-500" : "border-blue-100"
              }`}
            />
            {/* Error Message Display */}
            {formik.touched.email && formik.errors.email ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
            ) : null}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className={`w-full bg-blue-50 border px-5 py-4 rounded-xl outline-none text-lg focus:ring-2 focus:ring-blue-500 ${
                formik.touched.password && formik.errors.password ? "border-red-500" : "border-blue-100"
              }`}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer disabled:bg-blue-300"
          >
            {formik.isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}