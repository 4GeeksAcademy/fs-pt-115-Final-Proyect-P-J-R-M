// Import necessary components and functions from react-router-dom.

import {
	createBrowserRouter,
	createRoutesFromElements,
	Route,
} from "react-router-dom";
import { RootLayout } from "./layout/Root.layout";
import { PublicLayout } from "./layout/Public.layout";
import { AuthLayout } from "./layout/Auth.layout";
import { UserLayout } from "./layout/User.layout";
import { Home } from "./pages/Home";
import { SignUp } from "./pages/auth/singup/SignUp"
import { LogIn } from "./pages/auth/login/LogIn"
import { PostsPage } from "./pages/public/posts/PostPage";
import { ResetPasswordRequest } from "./components/ResetPasswordRequest";
import ChatPage from "./pages/chat/ChatPage";
import { Dasborde } from "./pages/user/Dasborde/Dasborde";
import { FormNewPassword } from "./components/FormNewPassword";
import { AaaBox } from "./pages/3DBox/3DBox";


export const router = createBrowserRouter(
	createRoutesFromElements(
		<Route element={<RootLayout />}>
			<Route path="/" element={<PublicLayout />}>
				<Route index element={<Home />} />
				<Route path="*" element={<AaaBox />} />
				<Route path="/posts" element={<PostsPage />} />
			</Route>
			<Route element={<AuthLayout />}>
				<Route path="/signup" element={<SignUp />} />
				<Route path="/login" element={<LogIn />} />
			</Route>
			<Route element={<UserLayout />}>
				<Route path="/chats" element={<ChatPage />}></Route>
				<Route path="/dasborde" element={<Dasborde />}></Route>
				<Route path="/form-reset" element={<FormNewPassword />} />
				<Route path="/request-reset" element={<ResetPasswordRequest />} />

			</Route>
		</Route>
	)
);