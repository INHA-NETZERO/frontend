import { Bell, Search, Menu } from "lucide-react";

function Header({ onMenuClick }) {
  return (
    <header className="top-header">
      {/* 모바일에서만 메뉴 버튼 표시 */}
      <button
        className="mobile-menu-btn"
        onClick={onMenuClick}
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <div className="search-box">
        <Search size={18} />
        <input
          type="text"
          placeholder="품목·이력 검색"
        />
      </div>

      <div className="header-right">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>

        <div className="profile-circle">
          강
        </div>

        <div className="store-info">
          <strong>강남역점</strong>
          <span>점주 · Admin</span>
        </div>
      </div>
    </header>
  );
}

export default Header;