import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/src/components/sidebar/sidebar';
import { VersionSwitcher } from './space-switcher';
import Link from 'next/link';
import type { UrlObject } from 'url';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Clock, EyeOff, Users } from 'lucide-react';
import { Separator } from '../ui/separator';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const data = {
    versions: ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'],
    navMain: [
      {
        title: 'Recent',
        icon: <Clock className="mr-1.5" />,
        items: [
          {
            title: 'Project 1',
            url: '#',
            isActive: true,
          },
          {
            title: 'Project 2',
            url: '#',
            isActive: false,
          },
        ],
      },
      {
        title: 'Users',
        icon: <Users className="mr-1.5" />,
        items: [
          {
            title: 'Igor Konoval (you)',
            isActive: false,
          },
          {
            title: 'Jane Doe',
            isActive: false,
          },
        ],
      },
      {
        title: 'Private',
        icon: <EyeOff className="mr-1.5" />,
        items: [
          {
            title: 'Project 1',
            isActive: false,
            url: '#',
          },
        ],
      },
    ],
  };
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
      </SidebarHeader>
      <SidebarContent>
        <Accordion
          type="multiple"
          defaultValue={data.navMain.map((item) => item.title)}
        >
          {data.navMain.map((item) => (
            <SidebarGroup className="py-0" key={item.title}>
              <AccordionItem value={item.title}>
                <AccordionTrigger className="py-0">
                  <SidebarGroupLabel>
                    {item.icon} {item.title}
                  </SidebarGroupLabel>
                </AccordionTrigger>
                <AccordionContent className="ml-3 h-auto pb-0">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item.items.map((item) => (
                        <SidebarMenuItem
                          className="hover:bg-(--sidebar-item-hover) rounded-md transition-colors hover:cursor-pointer"
                          key={item.title}
                        >
                          <SidebarMenuButton asChild isActive={item?.isActive}>
                            {'url' in item ? (
                              <Link href={item.url as unknown as UrlObject}>
                                {item.title}
                              </Link>
                            ) : (
                              <span>{item.title}</span>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </AccordionContent>
                <Separator className="my-2" />
              </AccordionItem>
            </SidebarGroup>
          ))}
        </Accordion>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
