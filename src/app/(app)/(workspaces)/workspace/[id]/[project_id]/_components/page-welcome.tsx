import { FileText, Sparkles, Plus } from 'lucide-react';
import { features } from '@/src/app/(app)/(workspaces)/workspace/[id]/[project_id]/constants/features.constants';
import { Button } from '@/src/components/ui/button';
import { CreateProjectModal } from '@/src/components/sidebar/projects/create-project/create-project-modal';
import { ProjectVisibility } from '@/src/constants/projects.constants';

type PageWelcomeProps = {
  workspaceId?: string;
};

export function PageWelcome({ workspaceId }: PageWelcomeProps) {
  return (
    <main className="bg-background min-h-auto flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="bg-brand text-brand-foreground mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl">
          <FileText className="size-8" aria-hidden="true" />
        </div>

        <h1 className="text-foreground text-balance text-2xl font-semibold sm:text-3xl">
          Create the first page within the current project
        </h1>

        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-pretty leading-relaxed">
          This is currently empty. Pages are a flexible space where you can
          collect interactive and fully editable content: text, tables, to-do
          lists, and much more.
        </p>

        <div className="mt-8 flex items-center justify-center">
          {workspaceId && (
            <CreateProjectModal
              trigger={
                <Button size="lg" variant="primary">
                  <Plus className="size-4" aria-hidden="true" />
                  Create the first page
                </Button>
              }
              workspaceId={workspaceId}
              visibility={ProjectVisibility.PRIVATE}
            />
          )}
        </div>

        <ul className="mt-12 grid gap-4 text-left sm:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="border-border bg-card hover:border-brand/40 rounded-xl border p-4 transition-colors"
            >
              <div className="bg-secondary text-foreground mb-3 flex size-9 items-center justify-center rounded-lg">
                <feature.icon className="size-4.5" aria-hidden="true" />
              </div>
              <h2 className="text-card-foreground text-sm font-medium">
                {feature.title}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>

        <p className="text-muted-foreground mt-10 inline-flex items-center gap-1.5 text-xs">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Everything you add can be edited at any time
        </p>
      </div>
    </main>
  );
}
