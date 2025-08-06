import {Link} from "wouter";

import {LayoutGrid, ToyBrick} from "lucide-react";

interface LeftNavItemProps {
    icon: React.ReactNode;
    title: string;
    href: string;
}

const LeftNavItem = ({href, title, icon}: LeftNavItemProps) => {
    return (
        <li>
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
