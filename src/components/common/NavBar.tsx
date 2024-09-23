"use client";
import { menuItems, type MenuItem } from "@/config/menuItems.config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ComponentProps,
  ReactNode,
  useState,
  useRef,
  useCallback,
} from "react";
import Profile from "./Profile";
import Image from "next/image";

// Update the MenuItem interface in your menuItems.config.ts file

function NavBar() {
  return (
    <div>
      <nav className="fixed w-full z-20 top-0 start-0 border-b md:px-10 bg-secondary">
        <div className="max-w-screen-xxl flex flex-wrap items-center justify-between mx-auto">
          <a
            href="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <Image
              src="/cognizant.svg"
              // // fill
              // sizes="(max-width: 75px) 100vw, (max-width: 150px) 50vw, 33vw"
              height={1}
              width={1}
              priority={false}
              style={{ height: "auto", width: "3vw" }}
              quality={50}
              alt="Company Logo"
            ></Image>
            <div className="flex flex-col">
              <span className="self-left text-lg font-semibold whitespace-nowrap tracking-[1em]">
                {process.env.NEXT_PUBLIC_APP_NAME}
              </span>
              <span className=" whitespace-nowrap" style={{ fontSize: "12px" }}>
                Very Elaborate Diagnostic Info.
              </span>
            </div>
          </a>

          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-sticky"
          >
            <ul className="flex flex-col font-medium md:p-0 border border-gray-100 rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
              {menuItems?.map((menuItem: MenuItem, menuIndex: number) => (
                <NavItem key={menuItem.displayName} menuItem={menuItem} />
              ))}
            </ul>
          </div>

          {/* Profile and mobile menu button (unchanged) */}
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <Profile />
            {/* ... (keep the existing mobile menu button code) ... */}
          </div>
        </div>
      </nav>
    </div>
  );
}

function NavItem({ menuItem }: { menuItem: MenuItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const CLOSE_DELAY = 300; // Configurable delay in milliseconds

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, CLOSE_DELAY);
  }, []);

  const Badge = ({ text }: { text: string }) => (
    <span className="ml-auto pl-1 px-1 py-1 text-[8px] font-semibold rounded-full bg-primary text-primary-foreground whitespace-nowrap">
      {text}
    </span>
  );

  if (menuItem.subMenu) {
    return (
      <li
        className="relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          className={cn(
            "h-full py-4 px-3 flex items-center w-full",
            pathname.includes(menuItem.hyperLink) &&
              "bg-primary text-primary-foreground"
          )}
        >
          <span className="flex-grow text-left">{menuItem.displayName}</span>
          {menuItem.badge && <Badge text={menuItem.badge} />}
          <svg
            className="w-2.5 h-2.5 ml-2.5 flex-shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 4 4 4-4"
            />
          </svg>
        </button>
        {isOpen && (
          <ul className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
            {menuItem.subMenu.map((subItem) => (
              <li key={subItem.displayName}>
                <NavLink
                  href={subItem.hyperLink}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <span className="flex-grow">{subItem.displayName}</span>
                  {subItem.badge && <Badge text={subItem.badge} />}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li>
      <NavLink href={menuItem.hyperLink} className="flex items-center">
        <span className="flex-grow">{menuItem.displayName}</span>
        {menuItem.badge && <Badge text={menuItem.badge} />}
      </NavLink>
    </li>
  );
}

function NavLink({
  href,
  children,
  className,
  ...props
}: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={cn(
        "h-full py-4 px-3 block w-full",
        pathname.includes(href.toString()) &&
          "bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export default NavBar;
