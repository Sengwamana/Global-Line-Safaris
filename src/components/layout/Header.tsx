"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  Phone,
  Mail,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { mainNav, ctaNav, type NavItem } from "@/lib/navigation";
import { siteConfig } from "@/lib/site";

/** Width at which the CSS swaps the link bar for the mobile sheet. Keep in step
 *  with the media queries in src/styles/safari.css. */
// The full navigation has nine labels plus a booking CTA. At typical laptop
// widths it cannot remain legible without overlapping, so use the menu sheet
// until there is enough room for every item.
const DESKTOP_BREAKPOINT = "(min-width: 1480px)";
const SCROLL_THRESHOLD = 24;

const subscribeToScroll = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};

export function Header() {
  const pathname = usePathname();
  // Menu state is keyed to the route it was opened on, so a navigation closes
  // the sheet without needing an effect to close it.
  const [menuRoute, setMenuRoute] = useState<string | null>(null);
  const menuOpen = menuRoute === pathname;
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const scrolled = useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > SCROLL_THRESHOLD,
    () => false
  );

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuRoute(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Trap focus inside the mobile nav overlay when it's open
  useEffect(() => {
    if (!menuOpen) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = overlay.querySelectorAll<HTMLElement>(focusableSelectors);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus the first element when the menu opens
    firstElement?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        // Shift+Tab on the first element: wrap to the last element
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab on the last element: wrap to the first element
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Return focus to the toggle button when the menu closes
      toggleRef.current?.focus();
    };
  }, [menuOpen]);

  // Don't strand the page scroll-locked if the viewport grows past the
  // breakpoint where the sheet is hidden.
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP_BREAKPOINT);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMenuRoute(null);
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  const isExact = (href: string) => pathname === href;

  // True when `href` is the current page or an ancestor of it.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  // Only one nav entry may claim the current page. A dropdown child is active
  // on an exact match only — otherwise "/destinations" would light up
  // "All Destinations" while you are on a specific park.
  const activeChild = (children: NavItem[]) =>
    children.find((child) => isExact(child.href));

  const closeMenu = () => setMenuRoute(null);
  const toggleMenu = useCallback(
    () => setMenuRoute((route) => (route === pathname ? null : pathname)),
    [pathname]
  );

  return (
    <>
      <header className={`safari-header${scrolled ? " scrolled" : ""}`}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>

        <div className="safari-topbar">
          <div className="safari-topbar-inner">
            <a className="safari-topbar-item" href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
              <Phone width={12} height={12} aria-hidden="true" />
              {siteConfig.phone}
            </a>
            <a className="safari-topbar-item" href={`mailto:${siteConfig.email}`}>
              <Mail width={12} height={12} aria-hidden="true" />
              {siteConfig.email}
            </a>
            <span className="safari-topbar-item safari-topbar-hours">
              {siteConfig.hours}
            </span>
            <div className="safari-topbar-socials">
              {siteConfig.socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="safari-nav">
          <div className="safari-brand">
            <Logo showWordmark={false} className="safari-brand-logo" />
            <span className="safari-brand-wordmark">
              <span className="safari-brand-name">{siteConfig.shortName}</span>
              <span className="safari-brand-tagline">{siteConfig.tagline}</span>
            </span>
          </div>

          <nav className="desktop-nav" aria-label="Main navigation">
            {mainNav.map((item) => {
              const current = isExact(item.href);

              if (item.children?.length) {
                // Highlight the branch when you are anywhere inside it.
                const inBranch = isActive(item.href);
                const matched = activeChild(item.children);
                // A child can share the parent's href ("All Destinations"), so
                // only one of them may claim aria-current.
                const claimsCurrent = isExact(item.href) && matched?.href !== item.href;
                return (
                  <div
                    key={item.href}
                    className={`nav-item nav-item-dropdown${inBranch ? " active" : ""}`}
                  >
                    <Link
                      href={item.href}
                      className="nav-item-trigger"
                      aria-current={claimsCurrent ? "page" : undefined}
                      aria-haspopup="true"
                    >
                      {item.label}
                      <ChevronDown width={12} height={12} aria-hidden="true" />
                    </Link>
                    <div className="nav-dropdown">
                      <span className="nav-dropdown-label">{item.label}</span>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`nav-dropdown-link${
                            matched?.href === child.href ? " active" : ""
                          }`}
                          aria-current={matched?.href === child.href ? "page" : undefined}
                        >
                          {child.label}
                          <ArrowRight width={13} height={13} aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item${item.href === "/gallery" ? " nav-item-secondary" : ""}${
                    // A leaf link still highlights on its own sub-pages
                    // (e.g. /services/tours-and-experiences), but only claims
                    // aria-current when it is the exact page.
                    isActive(item.href) ? " active" : ""
                  }`}
                  aria-current={current ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="safari-nav-actions">
            <a className="nav-phone" href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
              <Phone width={14} height={14} aria-hidden="true" />
              <span>{siteConfig.phone}</span>
            </a>
            <Link className="safari-button nav-cta" href={ctaNav.href}>
              {ctaNav.label}
              <ArrowUpRight width={14} height={14} aria-hidden="true" />
            </Link>
            <button
              ref={toggleRef}
              className="menu-toggle"
              aria-controls="mobile-nav-overlay"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={toggleMenu}
            >
              {menuOpen ? (
                <X width={20} height={20} />
              ) : (
                <Menu width={20} height={20} />
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        ref={overlayRef}
        className={`mobile-nav-overlay${menuOpen ? " open" : ""}`}
        id="mobile-nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeMenu();
        }}
      >
        <div className="mobile-nav-header">
          <span className="safari-brand">
            <Logo showWordmark={false} />
            <span className="safari-brand-wordmark">
              <span className="safari-brand-name">{siteConfig.shortName}</span>
            </span>
          </span>
          <button className="mobile-nav-close" aria-label="Close menu" onClick={closeMenu}>
            <X width={20} height={20} />
          </button>
        </div>

        <nav className="mobile-nav-links" aria-label="Mobile navigation">
          {mainNav.map((item, index) => (
            <MobileNavItem
              key={item.href}
              item={item}
              index={index}
              isActive={isActive}
              isExact={isExact}
              activeChild={activeChild}
              onNavigate={closeMenu}
            />
          ))}
        </nav>

        <div className="mobile-nav-footer">
          <Link className="safari-button" href={ctaNav.href} onClick={closeMenu}>
            {ctaNav.label}
            <ArrowUpRight width={14} height={14} aria-hidden="true" />
          </Link>

          <div className="mobile-nav-contact">
            <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
              <Phone width={13} height={13} aria-hidden="true" />
              {siteConfig.phone}
            </a>
            <a href={`mailto:${siteConfig.email}`}>
              <Mail width={13} height={13} aria-hidden="true" />
              {siteConfig.email}
            </a>
          </div>

          <div className="mobile-nav-socials">
            {siteConfig.socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function MobileNavItem({
  item,
  index,
  isActive,
  isExact,
  activeChild,
  onNavigate,
}: {
  item: NavItem;
  index: number;
  isActive: (href: string) => boolean;
  isExact: (href: string) => boolean;
  activeChild: (children: NavItem[]) => NavItem | undefined;
  onNavigate: () => void;
}) {
  const current = isExact(item.href);
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const matched = hasChildren ? activeChild(children) : undefined;
  // Defaults open when the accordion holds the page you are on; null means
  // "the user hasn't touched it yet".
  const [openOverride, setOpenOverride] = useState<boolean | null>(null);
  const open = openOverride ?? Boolean(matched);

  return (
    <div className="mobile-nav-item">
      <div className="mobile-nav-item-row">
        <span className="mobile-nav-index" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <Link
          href={item.href}
          className={`mobile-nav-link${isActive(item.href) ? " active" : ""}`}
          onClick={onNavigate}
          aria-current={current ? "page" : undefined}
        >
          {item.label}
        </Link>
        {hasChildren && (
          <button
            type="button"
            className={`mobile-nav-expand${open ? " open" : ""}`}
            aria-expanded={open}
            aria-label={`${open ? "Hide" : "Show"} ${item.label} sub-navigation`}
            onClick={() => setOpenOverride(!open)}
          >
            <ChevronDown width={16} height={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {hasChildren && (
        <div className={`mobile-nav-sub${open ? " open" : ""}`}>
          {children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={`mobile-nav-sublink${
                matched?.href === child.href ? " active" : ""
              }`}
              onClick={onNavigate}
              aria-current={matched?.href === child.href ? "page" : undefined}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
