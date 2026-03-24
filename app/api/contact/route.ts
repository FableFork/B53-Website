import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, company, description } = await req.json();

  if (!name || !email || !description) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const body = {
    parent: { database_id: process.env.NOTION_INBOUND_DB! },
    properties: {
      Name: {
        title: [{ text: { content: name } }],
      },
      Email: {
        rich_text: [{ text: { content: email } }],
      },
      Company: {
        rich_text: [{ text: { content: company ?? "" } }],
      },
      Description: {
        rich_text: [{ text: { content: description } }],
      },
    },
  };

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Notion error:", err);
    return NextResponse.json({ error: "Failed to submit." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
