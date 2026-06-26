import { NavLink } from "react-router-dom";
import { Home, ShoppingCart, Package, Upload, BarChart3, Zap } from "lucide-react";

const menus = [
  { path: "/home", label: "홈", icon: Home },
  { path: "/order", label: "발주", icon: ShoppingCart },
  { path: "/inventory", label: "재고", icon: Package },
  { path: "/report", label: "리포트", icon: BarChart3 },
  { path: "/sales", label: "판매 데이터", icon: Upload },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <Zap size={22} />
        </div>
        <div>
          <h1>Zero-Waste</h1>
          <p>COPILOT</p>
        </div>
      </div>

      <p className="menu-label">메뉴</p>

      <nav className="side-nav">
        {menus.map((menu) => {
          const Icon = menu.icon;
          return (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Icon size={18} />
              <span>{menu.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="today-summary">
        <p>오늘</p>
        <div>
          <span>예상 폐기 감소</span>
          <strong>4.8 kg</strong>
        </div>
        <div>
          <span>예상 절감 원가</span>
          <strong>₩39,700</strong>
        </div>
        <div>
          <span>예상 탄소 절감</span>
          <strong>7.2 kg</strong>
        </div>
      </div>

      <div className="store-card">
        <div className="store-avatar">강</div>
        <div>
          <strong>강남역점</strong>
          <p>강남구 · Pro 플랜</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;