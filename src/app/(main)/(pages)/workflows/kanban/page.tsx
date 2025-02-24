import BoardListContextProvider from "./store/BoardListContext";
import ThemeContextProvider from "./store/ThemeContext";


export default function KanbanDashboard({ children }: { children: React.ReactNode }) {
    return (
        <ThemeContextProvider>
            <BoardListContextProvider>{children}</BoardListContextProvider>
        </ThemeContextProvider>
    );
}
