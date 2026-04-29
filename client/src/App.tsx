import { Navigate, Route, Routes } from "react-router-dom";
import { ListsPage } from "./pages/ListsPage";
import { ListDetailPage } from "./pages/ListDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ListsPage />} />
      <Route path="/lists/:id" element={<ListDetailPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
