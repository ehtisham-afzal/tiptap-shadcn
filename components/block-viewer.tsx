"use client";
import * as React from "react";
// import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Clipboard,
  File,
  Folder,
  Fullscreen,
  Monitor,
  Smartphone,
  Tablet,
  Terminal,
  //   X,
} from "lucide-react";
import { ImperativePanelHandle } from "react-resizable-panels";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { OpenInV0Button } from "./open-in-v0-button";

interface FileContent {
  name: string;
  path: string;
  content: string;
  highlightedContent?: string;
}

interface TreeItem {
  name: string;
  path?: string;
  children?: TreeItem[];
}

interface BlockViewerItem {
  name: string;
  component: React.ReactNode;
  description: string;
  files: FileContent[];
}

type BlockViewerContext = {
  item: BlockViewerItem;
  view: "code" | "preview";
  setView: (view: "code" | "preview") => void;
  style?: string;
  setStyle: (style: string) => void;
  activeFile: string | null;
  setActiveFile: (file: string) => void;
  resizablePanelRef: React.RefObject<ImperativePanelHandle | null>;
  tree: TreeItem[];
  highlightedFiles: FileContent[] | null;
};

const BlockViewerContext = React.createContext<BlockViewerContext | null>(null);

function useBlockViewer() {
  const context = React.useContext(BlockViewerContext);
  if (!context) {
    throw new Error("useBlockViewer must be used within a BlockViewerProvider");
  }
  return context;
}

function BlockViewerProvider({
  item,
  tree,
  highlightedFiles,
  children,
}: {
  item: BlockViewerItem;
  tree: TreeItem[];
  highlightedFiles: FileContent[];
  children: React.ReactNode;
}) {
  const [view, setView] = React.useState<"code" | "preview">("preview");
  const [style, setStyle] = React.useState<string>("default");
  const [activeFile, setActiveFile] = React.useState<string | null>(
    highlightedFiles?.[0]?.path ?? null
  );
  const resizablePanelRef = React.useRef<ImperativePanelHandle | null>(null);

  return (
    <BlockViewerContext.Provider
      value={{
        item,
        view,
        setView,
        style,
        setStyle,
        resizablePanelRef,
        activeFile,
        setActiveFile,
        tree,
        highlightedFiles,
      }}
    >
      <div
        id={item.name}
        data-view={view}
        className="group/block-view-wrapper flex min-w-0 flex-col items-stretch gap-4"
      >
        {children}
      </div>
    </BlockViewerContext.Provider>
  );
}

function BlockViewerToolbar() {
  const { setView, item, resizablePanelRef } = useBlockViewer();
  const { copyToClipboard: copy, isCopied } = useCopyToClipboard();

  return (
    <div className="flex w-full items-center gap-2 md:pr-[14px]">
      <Tabs
        defaultValue="preview"
        onValueChange={(value) => setView(value as "preview" | "code")}
        className="hidden lg:flex"
      >
        <TabsList className="h-7 items-center rounded-md p-0 px-[calc(0.25rem-2px)] py-1">
          <TabsTrigger
            value="preview"
            className="h-[1.45rem] rounded-xs px-2 text-xs"
          >
            Preview
          </TabsTrigger>
          <TabsTrigger
            value="code"
            className="h-[1.45rem] rounded-xs px-2 text-xs"
          >
            Code
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Separator orientation="vertical" className="mx-2 hidden h-4 lg:flex" />
      <div className="text-sm font-medium">{item.description}</div>
      <div className="ml-auto hidden items-center gap-2 md:flex">
        <div className="hidden h-7 items-center gap-1.5 rounded-md border p-[2px] shadow-none lg:flex">
          <ToggleGroup
            type="single"
            defaultValue="100"
            onValueChange={(value) => {
              if (resizablePanelRef?.current) {
                resizablePanelRef.current.resize(parseInt(value));
              }
            }}
          >
            <ToggleGroupItem
              value="100"
              className="h-[22px] w-[22px] min-w-0 rounded-xs p-0"
              title="Desktop"
            >
              <Monitor className="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="60"
              className="h-[22px] w-[22px] min-w-0 rounded-xs p-0"
              title="Tablet"
            >
              <Tablet className="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="30"
              className="h-[22px] w-[22px] min-w-0 rounded-xs p-0"
              title="Mobile"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <Separator orientation="vertical" className="h-4" />
            <Button
              size="icon"
              variant="ghost"
              className="h-[22px] w-[22px] rounded-xs p-0"
              asChild
              title="Open in New Tab"
            >
              <Link href={`blocks/${item.name}`} target="_blank">
                <span className="sr-only">Open in New Tab</span>
                <Fullscreen className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </ToggleGroup>
        </div>
        <Separator orientation="vertical" className="mx-1 hidden h-4 md:flex" />
        <div className="flex h-7 items-center gap-1 rounded-md border p-[2px]">
          <Button
            variant="ghost"
            className="hidden h-[22px] w-auto gap-1 rounded-xs px-2 md:flex lg:w-auto"
            size="sm"
            onClick={() => {
              copy(
                `npx shadcn@latest add http://tiptap-shadcn.vercel.app/r/${item.name}.json`
              );
            }}
          >
            {isCopied ? <Check /> : <Terminal />}
            <span className="hidden lg:inline">npx shadcn add {item.name}</span>
          </Button>
        </div>
        <Separator orientation="vertical" className="mx-1 hidden h-4 xl:flex" />
        <OpenInV0Button
          className="hidden shadow-none sm:flex rounded-md"
          name={`${item.name}`}
        />
      </div>
    </div>
  );
}

function BlockViewerView() {
  const { item, resizablePanelRef } = useBlockViewer();

  return (
    <div className="group-data-[view=code]/block-view-wrapper:hidden md:h-[700px]">
      <ResizablePanelGroup direction="horizontal" className="relative z-10">
        <ResizablePanel
          ref={resizablePanelRef}
          className="relative rounded-xl border bg-background"
          defaultSize={100}
          minSize={30}
        >
          <div className="h-full w-full">{item.component}</div>
        </ResizablePanel>
        <ResizableHandle className="relative hidden w-3 bg-transparent p-0 after:absolute after:right-0 after:top-1/2 after:h-8 after:w-[6px] after:-translate-y-1/2 after:translate-x-[-1px] after:rounded-full after:bg-border after:transition-all after:hover:h-10 md:block" />
        <ResizablePanel defaultSize={0} minSize={0} />
      </ResizablePanelGroup>
    </div>
  );
}

function BlockViewerCode() {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { activeFile, highlightedFiles } = useBlockViewer();

  const file = React.useMemo(() => {
    return highlightedFiles?.find((file) => file.path === activeFile);
  }, [highlightedFiles, activeFile]);

  if (!file) {
    return null;
  }

  return (
    <div className="mr-[14px] flex overflow-hidden rounded-xl bg-zinc-950 text-white group-data-[view=preview]/block-view-wrapper:hidden md:h-[600px]">
      <div className="w-[280px]">
        <BlockViewerFileTree />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 items-center gap-2 border-b border-zinc-700 bg-zinc-900 px-4 text-sm font-medium">
          <File className="size-4" />
          {file.path}
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={() => copyToClipboard(file.content)}
              className="h-7 w-7 shrink-0 rounded-lg p-0 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white focus-visible:bg-zinc-700 focus-visible:text-white active:bg-zinc-700 active:text-white data-[active=true]:bg-zinc-700 data-[active=true]:text-white [&>svg]:size-3"
              variant="ghost"
            >
              {isCopied ? (
                <Check className="size-4" />
              ) : (
                <Clipboard className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="relative flex-1 overflow-auto p-4">
          <pre className="text-sm">
            <code>{file.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export function BlockViewerFileTree() {
  const { tree } = useBlockViewer();

  if (!tree) {
    return null;
  }

  return (
    <SidebarProvider className="flex !min-h-full flex-col">
      <Sidebar
        collapsible="none"
        className="w-full flex-1 border-r border-zinc-700 bg-zinc-900 text-white"
      >
        <SidebarGroupLabel className="h-12 rounded-none border-b border-zinc-700 px-4 text-sm text-white">
          Files
        </SidebarGroupLabel>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {tree.map((file: TreeItem, index: number) => (
                <Tree key={index} item={file} index={1} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </Sidebar>
    </SidebarProvider>
  );
}

function Tree({
  item,
  index,
}: {
  item: TreeItem;
  index: number;
}): React.ReactElement {
  const { activeFile, setActiveFile } = useBlockViewer();

  if (!item.children) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={item.path === activeFile}
          onClick={() => item.path && setActiveFile(item.path)}
          className="whitespace-nowrap rounded-none pl-(--index) hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white focus-visible:bg-zinc-700 focus-visible:text-white active:bg-zinc-700 active:text-white data-[active=true]:bg-zinc-700 data-[active=true]:text-white"
          data-index={index}
          style={
            {
              "--index": `${index * (index === 2 ? 1.2 : 1.3)}rem`,
            } as React.CSSProperties
          }
        >
          <ChevronRight className="invisible" />
          <File className="h-4 w-4" />
          {item.name}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="whitespace-nowrap rounded-none pl-(--index) hover:bg-zinc-700 hover:text-white focus-visible:bg-zinc-700 focus-visible:text-white active:bg-zinc-700 active:text-white data-[active=true]:bg-zinc-700 data-[active=true]:text-white data-[state=open]:hover:bg-zinc-700 data-[state=open]:hover:text-white"
            style={
              {
                "--index": `${index * (index === 1 ? 1 : 1.2)}rem`,
              } as React.CSSProperties
            }
          >
            <ChevronRight className="h-4 w-4 transition-transform" />
            <Folder className="h-4 w-4" />
            {item.name}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="m-0 w-full border-none p-0">
            {item.children.map((subItem: TreeItem, key: number) => (
              <Tree key={key} item={subItem} index={index + 1} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}

export function BlockViewer({
  item,
  tree,
  highlightedFiles,
}: {
  item: BlockViewerItem;
  tree: TreeItem[];
  highlightedFiles: FileContent[];
}) {
  return (
    <BlockViewerProvider
      item={item}
      tree={tree}
      highlightedFiles={highlightedFiles}
    >
      <BlockViewerToolbar />
      <BlockViewerView />
      <BlockViewerCode />
    </BlockViewerProvider>
  );
}
