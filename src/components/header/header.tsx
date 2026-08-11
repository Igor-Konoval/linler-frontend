import { Star } from 'lucide-react';
import { SidebarTrigger } from '../sidebar/sidebar';
import { Button } from '../ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';
import { Separator } from '../ui/separator';
import { HeaderDropdownBtn } from './header-dropdown-btn';

export function Header() {
  return (
    <header className="h-(--header-height) group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) flex shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 pl-1 pr-4 lg:gap-2  lg:pr-6">
        <SidebarTrigger />
        <div className="ml-auto flex items-center gap-1">
          <HoverCard openDelay={200}>
            <HoverCardTrigger className="text-(--hover-card) px-1" asChild>
              <Button variant="ghost">Edited 1h ago</Button>
            </HoverCardTrigger>
            <HoverCardContent className="flex w-64 flex-col gap-0.5">
              <h6 className="font-semibold">Activity</h6>
              <Separator className="my-2" />
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-between gap-2 ">
                  <p>
                    Edited by <b>Igor Konoval (you)</b>
                  </p>
                  <p className="text-muted-foreground text-xs">1h ago</p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p>
                    Edited by <b>Jane Doe</b>
                  </p>
                  <p className="text-muted-foreground text-xs">2h ago</p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard openDelay={200}>
            <HoverCardTrigger className="px-1" asChild>
              <Button variant="ghost">
                <Star />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-fit">
              <p>Add to Favorites</p>
            </HoverCardContent>
          </HoverCard>

          <HeaderDropdownBtn />
        </div>
      </div>
    </header>
  );
}
