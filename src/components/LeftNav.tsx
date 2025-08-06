import {Link} from "wouter";
import {usePathname} from "wouter/use-browser-location";

import {LayoutGrid, ToyBrick} from "lucide-react";

interface LeftNavItemProps {
    icon: React.ReactNode;
    title: string;
    href: string;
}

const LeftNavItem = ({href, title, icon}: LeftNavItemProps) => {
    const is_active = usePathname() === href;

    return (
        <li className="indicator">
            {is_active &&
                <div className="indicator-item indicator-middle indicator-start flex flex-col items-center justify-center pointer-events-none">
                    <div className="rounded-full h-2 w-2 aspect-square bg-primary"></div>
                </div>
            }
            <Link href={href} className="tooltip tooltip-right" data-tip={title}>
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
      </ul>
    );
}
