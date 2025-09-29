import { Outlet } from "react-router-dom";
import { Footer } from "../components/footer/Footer";
import ScrollToTop from "../components/ScrollToTop";

export const AuthLayout = () => {

    return (
        <ScrollToTop>
            <div className="d-flex flex-column min-vh-100">
                <main className="flex-grow-1">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </ScrollToTop>
    )
}