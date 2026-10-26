import test from "node:test";
import assert from "node:assert/strict";
import {
  analyze,
  requestBody,
  validateProfile,
  defaults,
  type AIEntry,
  type AIKeyProfile,
} from "../src/ai";
const profile: AIKeyProfile = {
  id: "test",
  name: "test",
  provider: "qwen",
  ...defaults.qwen,
};
const entry: AIEntry = {
  id: "a",
  date: "2026-10-26",
  scene: "route",
  question: "Red route?",
  provider: "qwen",
  model: profile.model,
  status: "pending",
};
test("only official provider HTTPS endpoints receive keys", () => {
  validateProfile(profile);
  for (const baseURL of [
    "http://dashscope.aliyuncs.com",
    "https://evil.example/v1",
    "https://dashscope.aliyuncs.com.evil.example",
    "https://user:pass@dashscope.aliyuncs.com",
    "https://api.deepseek.com",
  ])
    assert.throws(() => validateProfile({ ...profile, baseURL }));
  validateProfile({
    ...profile,
    baseURL:
      "https://myworkspace.cn-beijing.maas.aliyuncs.com/compatible-mode/v1",
  });
});
test("media payload includes actual image/video and blocks unsupported video provider", () => {
  const image = {
    ...entry,
    attachment: { uri: "local", mime: "image/jpeg", name: "route" },
  };
  assert.throws(() => requestBody(image));
  assert.match(
    JSON.stringify(requestBody(image, "data:image/jpeg;base64,abc")),
    /image_url/,
  );
  const video = {
    ...image,
    attachment: { ...image.attachment, mime: "video/mp4" },
  };
  assert.match(
    JSON.stringify(requestBody(video, "data:video/mp4;base64,abc")),
    /video_url/,
  );
  assert.throws(() =>
    requestBody(
      { ...video, provider: "deepseek" },
      "data:video/mp4;base64,abc",
    ),
  );
});
test("adapter uses saved provider model, parses actual answer and rejects auth/empty responses", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async (url, options) => {
    calls++;
    assert.equal(url, profile.baseURL + "/chat/completions");
    assert.equal(JSON.parse(options!.body as string).model, profile.model);
    return new Response(
      JSON.stringify({
        choices: [{ message: { content: "Use a higher left foothold." } }],
      }),
    );
  };
  assert.equal(
    await analyze(entry, profile, "local-test-key", undefined, true, fetcher),
    "Use a higher left foothold.",
  );
  assert.equal(calls, 1);
  await assert.rejects(
    analyze(
      entry,
      profile,
      "test",
      undefined,
      false,
      async () => new Response("", { status: 401 }),
    ),
    /AUTH/,
  );
  await assert.rejects(
    analyze(
      entry,
      profile,
      "test",
      undefined,
      false,
      async () => new Response("{}"),
    ),
    /EMPTY/,
  );
});
