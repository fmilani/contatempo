"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { Loader2, Play, Square, TagsIcon } from "lucide-react";
import { intervalToDuration } from "date-fns";
import { Button } from "@/components/ui/button";
import { Record, RecordWithTags, Tag } from "@/lib/db/schema";
import { useInterval, useKeyPressEvent } from "@/lib/hooks";
import {
  RecentRecordsProvider,
  useRecentRecords,
} from "@/app/(user)/recent-records-provider";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import useSWR, { useSWRConfig } from "swr";
import { Checkbox } from "@/components/ui/checkbox";
import { createTag, updateRecordTags } from "../actions";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function appendTag(tags: Tag[], tagToAppend: Tag) {
  if (
    tags.some(
      (tag) =>
        tag.id === tagToAppend.id ||
        tag.name.toLowerCase() === tagToAppend.name.toLowerCase(),
    )
  ) {
    return tags;
  }

  return [...tags, tagToAppend];
}

function replaceOptimisticTag(
  tags: Tag[],
  optimisticTagId: number,
  nextTag: Tag,
) {
  let didReplace = false;
  const updatedTags = tags.flatMap((tag) => {
    if (tag.id === optimisticTagId) {
      didReplace = true;
      return [nextTag];
    }

    if (tag.id === nextTag.id) {
      return [];
    }

    return [tag];
  });

  return didReplace ? updatedTags : tags;
}

function removeTag(tags: Tag[], tagId: number) {
  return tags.filter((tag) => tag.id !== tagId);
}

export function RecordingContainer() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/sign-in" || pathname === "/sign-up")
    return null;
  return (
    <Suspense fallback="waaat">
      <RecentRecordsProvider>
        <Recording />
      </RecentRecordsProvider>
    </Suspense>
  );
}
function Recording() {
  const { recentRecords } = useRecentRecords();
  const ongoingRecord = recentRecords.find((record: Record) => !record.end);
  const recordingDivRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={recordingDivRef}
      className={cn(
        "border rounded-full flex gap-4 items-center",
        ongoingRecord && "pr-3 flex-1",
      )}
    >
      {ongoingRecord ? (
        <StopRecording record={ongoingRecord} />
      ) : (
        <StartRecording />
      )}
      {ongoingRecord && <OngoingDuration ongoingRecord={ongoingRecord} />}
      {ongoingRecord && <DescriptionForm record={ongoingRecord} />}
      {ongoingRecord && <TagsForm record={ongoingRecord} />}
    </div>
  );
}

function StartRecording() {
  const form = useRef<HTMLFormElement>(null);
  useKeyPressEvent("s", (event) => {
    event.preventDefault();
    form.current?.requestSubmit();
  });
  const { update } = useRecentRecords();
  return (
    <form
      ref={form}
      action={async () => {
        update({ type: "start-recording", date: new Date() });
      }}
    >
      <Button variant="ghost" size="icon-lg" className="rounded-full">
        <Play />
      </Button>
    </form>
  );
}

function StopRecording({ record }: { record: Record }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  useKeyPressEvent("s", (event) => {
    event.preventDefault();
    buttonRef.current?.click();
  });
  const { update } = useRecentRecords();
  return (
    <form
      action={async () => {
        update({
          type: "stop-recording",
          recordId: record.id,
          date: new Date(),
        });
      }}
    >
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon-lg"
        className="rounded-full"
        disabled={!record.id}
      >
        <Square />
      </Button>
    </form>
  );
}

function OngoingDuration({ ongoingRecord }: { ongoingRecord: Record }) {
  const [now, setNow] = useState(new Date());
  useInterval(() => setNow(new Date()), 500);
  const duration = intervalToDuration({ start: ongoingRecord.start, end: now });
  if (duration.hours) {
    duration.hours += (duration.days ?? 0) * 24;
  }
  return (
    <span className="font-mono">
      {duration.hours?.toString().padStart(2, "0") ?? "00"}:
      {duration.minutes?.toString().padStart(2, "0") ?? "00"}
      <span className="text-[0.8em] text-gray-500">
        :{duration.seconds?.toString().padStart(2, "0") ?? "00"}
      </span>
    </span>
  );
}

function DescriptionForm({ record }: { record: Record }) {
  const { update, updateDescriptionIsPending } = useRecentRecords();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useKeyPressEvent("Escape", () => {
    inputRef.current?.blur();
  });
  return (
    <form
      ref={formRef}
      className="flex-1"
      action={(formData) => {
        if (!record.id) {
          return;
        }
        update({
          type: "update-description",
          recordId: record.id,
          description: formData.get("description")?.toString() ?? "",
        });
        inputRef.current?.blur();
      }}
    >
      <InputGroup className="border-none">
        <InputGroupInput
          placeholder="what are you doing?"
          ref={inputRef}
          onBlur={() => {
            if (
              inputRef.current?.value &&
              inputRef.current?.value !== record.description
            ) {
              formRef.current?.requestSubmit();
            }
          }}
          autoFocus={!record.description}
          defaultValue={record.description ?? ""}
          name="description"
        />
        {updateDescriptionIsPending && (
          <InputGroupAddon align="inline-end">
            <Loader2 className="animate-spin" />
          </InputGroupAddon>
        )}
      </InputGroup>
    </form>
  );
}
export function TagsForm({ record }: { record: RecordWithTags }) {
  const { data: tags } = useSWR<Tag[]>("/api/user-tags", fetcher);
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const { update } = useRecentRecords();
  useKeyPressEvent("#", (event) => {
    event.preventDefault();
    setOpen(true);
  });
  const filteredTags = useMemo(() => {
    const v = searchInput.trim().toLowerCase();
    if (!v) return tags ?? [];

    return tags?.filter((tag) => tag.name.toLowerCase().includes(v)) ?? [];
  }, [tags, searchInput]);
  const exactMatchTag = useMemo(() => {
    const v = searchInput.trim().toLowerCase();
    if (!v) return null;

    return (tags ?? []).find((tag) => tag.name.toLowerCase() === v) ?? null;
  }, [tags, searchInput]);
  const canCreateTag = searchInput.trim().length > 0 && !exactMatchTag;

  async function handleCreate() {
    const name = searchInput.trim();
    if (!name) return;
    setSearchInput("");

    const optimisticTag: Tag = {
      id: -Date.now(),
      userId: record.userId,
      name,
      color: "slate",
    };
    await mutate<Tag[]>(
      "/api/user-tags",
      (currentTags) => appendTag(currentTags ?? [], optimisticTag),
      { revalidate: false },
    );

    await mutate<RecordWithTags[]>(
      "/api/recent-records",
      (currentRecords) =>
        (currentRecords ?? []).map((currentRecord) => {
          if (currentRecord.id !== record.id) {
            return currentRecord;
          }

          return {
            ...currentRecord,
            tags: appendTag(currentRecord.tags, optimisticTag),
          };
        }),
      { revalidate: false },
    );

    try {
      const createdTag = await createTag({ name });

      await mutate<Tag[]>(
        "/api/user-tags",
        (currentTags) => {
          const tagsWithoutOptimistic = removeTag(
            currentTags ?? [],
            optimisticTag.id,
          );
          return appendTag(tagsWithoutOptimistic, createdTag);
        },
        { revalidate: false },
      );

      let persistedTagIds: number[] = [];
      let shouldPersistTags = false;
      await mutate<RecordWithTags[]>(
        "/api/recent-records",
        (currentRecords) =>
          (currentRecords ?? []).map((currentRecord) => {
            if (currentRecord.id !== record.id) {
              return currentRecord;
            }

            const nextTags = replaceOptimisticTag(
              currentRecord.tags,
              optimisticTag.id,
              createdTag,
            );

            if (nextTags !== currentRecord.tags) {
              shouldPersistTags = true;
              persistedTagIds = nextTags
                .map((tag) => tag.id)
                .filter((tagId) => tagId > 0);
              return { ...currentRecord, tags: nextTags };
            }

            return currentRecord;
          }),
        { revalidate: false },
      );

      if (shouldPersistTags) {
        await updateRecordTags({
          recordId: record.id,
          tags: persistedTagIds,
        });
      }
    } catch {
      await mutate<Tag[]>(
        "/api/user-tags",
        (currentTags) => removeTag(currentTags ?? [], optimisticTag.id),
        { revalidate: false },
      );

      await mutate<RecordWithTags[]>(
        "/api/recent-records",
        (currentRecords) =>
          (currentRecords ?? []).map((currentRecord) => {
            if (currentRecord.id !== record.id) {
              return currentRecord;
            }

            return {
              ...currentRecord,
              tags: removeTag(currentRecord.tags, optimisticTag.id),
            };
          }),
        { revalidate: false },
      );
    }
  }

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setSearchInput("");
        }
        setOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost" className="relative">
          <TagsIcon />
          {record.tags.length > 0 && (
            <sub className="absolute bottom-2 right-2">
              {record.tags.length}
            </sub>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or create a tag"
            value={searchInput}
            onValueChange={setSearchInput}
          />
          <CommandList>
            <CommandGroup heading="Tags">
              {filteredTags.map((tag) => {
                const tagIsSelected = record.tags
                  .map((tag) => tag.id)
                  .includes(tag.id);
                const updatedTags = tagIsSelected
                  ? record.tags.filter((recordTag) => tag.id !== recordTag.id)
                  : [...record.tags, tag];
                return (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => {
                      setSearchInput("");
                      update({
                        type: "update-tags",
                        tags: updatedTags,
                        recordId: record.id,
                      });
                    }}
                  >
                    <Checkbox checked={tagIsSelected} />
                    {/* <TagIcon /> */}
                    {/* <TagBadge tag={tag}>{tag.name}</TagBadge> */}
                    {tag.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {canCreateTag && (
              <CommandGroup>
                <CommandItem onSelect={handleCreate} className="text-primary">
                  Create “{searchInput}”
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
