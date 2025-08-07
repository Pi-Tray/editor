import {Link} from "wouter";
import {usePathname} from "wouter/use-browser-location";

import {Files, LayoutGrid, Settings, ToyBrick} from "lucide-react";
import {motion, AnimatePresence} from "motion/react";

interface LeftNavItemProps {
    icon: React.ReactNode;
    title: string;
    href: string;
    className?: string;
    link_className?: string;
}

/**
 * An item in the left navigation bar.
 * @param href the path to link to
 * @param title the title of the item, shown in a tooltip
 * @param icon the icon to display
 * @param className additional class names for the list item
 * @param link_className additional class names for the link
 * @constructor
 */
const LeftNavItem = ({href, title, icon, className = "", link_className = ""}: LeftNavItemProps) => {
    const is_active = usePathname() === href;

    return (
        <li className={`indicator ${className}`}>
            <AnimatePresence>
                {is_active &&
                    <motion.div initial={{scale: 0}} animate={{scale: 1}} exit={{scale: 0}} className="indicator-item indicator-middle indicator-start flex flex-col items-center justify-center pointer-events-none">
                        <div className="rounded-full h-2 w-2 aspect-square bg-primary"></div>
                    </motion.div>
                }
            </AnimatePresence>
            <Link href={href} className={`tooltip tooltip-right ${link_className}`} data-tip={title}>
                {icon}
            </Link>
        </li>
    );
}

export const LeftNav = () => {
    return (
      <ul className="menu h-full bg-base-300">
          <LeftNavItem href="/" title="Grid Editor" icon={<LayoutGrid />} />
          <LeftNavItem href="/plugins" title="Plugin Manager" icon={<ToyBrick />} />
          <LeftNavItem href="/assets" title="Asset Manager" icon={<Files />} />
          
          <LeftNavItem href="/settings" title="Settings" icon={<Settings />} className="mt-auto" />
      </ul>
    );
}
