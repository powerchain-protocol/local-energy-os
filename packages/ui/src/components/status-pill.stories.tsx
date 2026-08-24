"use client";
import type { Meta,StoryObj } from "@storybook/react"; import { StatusPill } from "./status-pill";
const meta={title:"UI/StatusPill",component:StatusPill} satisfies Meta<typeof StatusPill>; export default meta;
export const Online:StoryObj<typeof meta>={args:{status:"online"}}; export const Warning:StoryObj<typeof meta>={args:{status:"warning"}}; export const Offline:StoryObj<typeof meta>={args:{status:"offline"}};
