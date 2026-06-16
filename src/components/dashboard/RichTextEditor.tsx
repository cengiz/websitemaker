"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Image from "@tiptap/extension-image";
import { useEffect, useRef } from "react";

const BTN =
  "rounded px-2 py-1 text-xs font-medium transition hover:bg-zinc-200 disabled:opacity-40 select-none";
const BTN_ON = "bg-zinc-300";
const SEP = <span className="mx-0.5 self-stretch border-l border-zinc-300" />;

function Btn({
  active,
  title,
  onClick,
  disabled,
  children,
}: {
  active?: boolean;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`${BTN} ${active ? BTN_ON : ""}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  name,
  initialValue = "",
  placeholder = "İçerik yazın...",
}: {
  name: string;
  initialValue?: string;
  placeholder?: string;
}) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ horizontalRule: {} }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
    ],
    content: initialValue || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-64 rounded-b-md border-x border-b border-zinc-300 bg-white px-4 py-3 text-sm focus:outline-none prose prose-sm max-w-none",
      },
    },
    onUpdate({ editor }) {
      if (hiddenRef.current) {
        hiddenRef.current.value = editor.isEmpty ? "" : editor.getHTML();
      }
    },
  });

  useEffect(() => {
    if (hiddenRef.current) {
      hiddenRef.current.value =
        editor && !editor.isEmpty ? editor.getHTML() : initialValue ?? "";
    }
  }, [editor, initialValue]);

  function addLink() {
    const prev = editor?.getAttributes("link").href ?? "";
    const url = window.prompt("Link URL", prev);
    if (url === null) return;
    if (!url) { editor?.chain().focus().unsetLink().run(); return; }
    editor?.chain().focus().setLink({ href: url }).run();
  }

  function addImage() {
    const url = window.prompt("Görsel URL");
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }

  function insertTable() {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  function setColor(e: React.ChangeEvent<HTMLInputElement>) {
    editor?.chain().focus().setColor(e.target.value).run();
  }

  function setHighlight(e: React.ChangeEvent<HTMLInputElement>) {
    editor?.chain().focus().setHighlight({ color: e.target.value }).run();
  }

  if (!editor) return null;

  const inTable = editor.isActive("table");

  return (
    <div className="flex flex-col">
      <input type="hidden" name={name} ref={hiddenRef} defaultValue={initialValue} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-zinc-300 bg-zinc-50 px-2 py-1.5">
        {/* History */}
        <Btn title="Geri al" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>↩</Btn>
        <Btn title="İleri al" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>↪</Btn>
        {SEP}

        {/* Text style */}
        <Btn active={editor.isActive("bold")} title="Kalın (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></Btn>
        <Btn active={editor.isActive("italic")} title="İtalik (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></Btn>
        <Btn active={editor.isActive("underline")} title="Altı çizili (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()}><span className="underline">U</span></Btn>
        <Btn active={editor.isActive("strike")} title="Üstü çizili" onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></Btn>
        <Btn active={editor.isActive("subscript")} title="Alt simge" onClick={() => editor.chain().focus().toggleSubscript().run()}>x₂</Btn>
        <Btn active={editor.isActive("superscript")} title="Üst simge" onClick={() => editor.chain().focus().toggleSuperscript().run()}>x²</Btn>
        {SEP}

        {/* Color */}
        <label title="Yazı rengi" className={`${BTN} flex items-center gap-1 cursor-pointer`}>
          <span style={{ borderBottom: `3px solid ${editor.getAttributes("textStyle").color ?? "#000000"}` }}>A</span>
          <input type="color" className="h-0 w-0 opacity-0 absolute" onChange={setColor} />
        </label>
        <label title="Vurgu rengi" className={`${BTN} flex items-center gap-1 cursor-pointer`}>
          <span className="rounded px-0.5" style={{ backgroundColor: editor.getAttributes("highlight").color ?? "#ffff00" }}>H</span>
          <input type="color" className="h-0 w-0 opacity-0 absolute" defaultValue="#ffff00" onChange={setHighlight} />
        </label>
        <Btn title="Vurguyu kaldır" onClick={() => editor.chain().focus().unsetHighlight().run()}>✕H</Btn>
        {SEP}

        {/* Headings */}
        <Btn active={editor.isActive("heading", { level: 1 })} title="Başlık 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Btn>
        <Btn active={editor.isActive("heading", { level: 2 })} title="Başlık 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
        <Btn active={editor.isActive("heading", { level: 3 })} title="Başlık 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
        <Btn active={editor.isActive("paragraph")} title="Normal metin" onClick={() => editor.chain().focus().setParagraph().run()}>¶</Btn>
        {SEP}

        {/* Align */}
        <Btn active={editor.isActive({ textAlign: "left" })} title="Sola hizala" onClick={() => editor.chain().focus().setTextAlign("left").run()}>⬅</Btn>
        <Btn active={editor.isActive({ textAlign: "center" })} title="Ortala" onClick={() => editor.chain().focus().setTextAlign("center").run()}>≡</Btn>
        <Btn active={editor.isActive({ textAlign: "right" })} title="Sağa hizala" onClick={() => editor.chain().focus().setTextAlign("right").run()}>➡</Btn>
        <Btn active={editor.isActive({ textAlign: "justify" })} title="İki yana yasla" onClick={() => editor.chain().focus().setTextAlign("justify").run()}>☰</Btn>
        {SEP}

        {/* Lists */}
        <Btn active={editor.isActive("bulletList")} title="Madde listesi" onClick={() => editor.chain().focus().toggleBulletList().run()}>• —</Btn>
        <Btn active={editor.isActive("orderedList")} title="Numaralı liste" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. —</Btn>
        <Btn active={editor.isActive("taskList")} title="Görev listesi" onClick={() => editor.chain().focus().toggleTaskList().run()}>☑</Btn>
        {SEP}

        {/* Block */}
        <Btn active={editor.isActive("blockquote")} title="Alıntı" onClick={() => editor.chain().focus().toggleBlockquote().run()}>"</Btn>
        <Btn active={editor.isActive("code")} title="Satır içi kod" onClick={() => editor.chain().focus().toggleCode().run()}>`</Btn>
        <Btn active={editor.isActive("codeBlock")} title="Kod bloğu" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{"</>"}</Btn>
        <Btn title="Yatay çizgi" onClick={() => editor.chain().focus().setHorizontalRule().run()}>—</Btn>
        {SEP}

        {/* Link */}
        <Btn active={editor.isActive("link")} title="Link ekle/düzenle" onClick={addLink}>🔗</Btn>
        {SEP}

        {/* Image */}
        <Btn title="Görsel ekle (URL)" onClick={addImage}>🖼</Btn>
        {SEP}

        {/* Table */}
        <Btn title="Tablo ekle" onClick={insertTable}>⊞</Btn>
        {inTable && (<>
          <Btn title="Sütun ekle (sol)" onClick={() => editor.chain().focus().addColumnBefore().run()}>◁+</Btn>
          <Btn title="Sütun ekle (sağ)" onClick={() => editor.chain().focus().addColumnAfter().run()}>+▷</Btn>
          <Btn title="Satır ekle (üst)" onClick={() => editor.chain().focus().addRowBefore().run()}>△+</Btn>
          <Btn title="Satır ekle (alt)" onClick={() => editor.chain().focus().addRowAfter().run()}>+▽</Btn>
          <Btn title="Sütunu sil" onClick={() => editor.chain().focus().deleteColumn().run()}>✕Col</Btn>
          <Btn title="Satırı sil" onClick={() => editor.chain().focus().deleteRow().run()}>✕Row</Btn>
          <Btn title="Tabloyu sil" onClick={() => editor.chain().focus().deleteTable().run()}>✕Tbl</Btn>
        </>)}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
