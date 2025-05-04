import { FC, ReactNode } from "react"
import OrdersSection from "./OrdersSection"
import ProfileSection from "./ProfileSection"
import WishlistSection from "./WishlistSection"

const tabs = ["Orders", "Profile", "Wishlist"] as const
type Tab = typeof tabs[number]

interface Props {
  activeTab: Tab
  onTabChange: (t: Tab) => void
}

const AccountLayout: FC<Props> = ({ activeTab, onTabChange }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <nav className="flex space-x-4 border-b mb-6">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onTabChange(t)}
          className={`pb-2 ${
            activeTab === t
              ? "border-b-2 border-amber-800 text-amber-800"
              : "text-stone-600 hover:text-stone-800 cursor-pointer"
          }`}
        >
          {t}
        </button>
      ))}
    </nav>

    <div>
      {activeTab === "Orders" && <OrdersSection />}
      {activeTab === "Profile" && <ProfileSection />}
      {activeTab === "Wishlist" && <WishlistSection />}
    </div>
  </div>
)

export default AccountLayout
