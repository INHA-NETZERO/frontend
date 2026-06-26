import { Bell, Search } from "lucide-react";

function Header() {
  return (
    <header className="top-header">

      <div className="search-box">
        <Search size={18}/>
        <input
          type="text"
          placeholder="품목·이력 검색"
        />
      </div>

      <div className="header-right">

        <button className="icon-btn">
          <Bell size={18}/>
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