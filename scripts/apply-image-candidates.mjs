import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectsPath = path.join(rootDir, "data", "projects.json");
const reportPath = process.argv[2] ?? "/private/tmp/soma-image-candidates.json";

const manualCandidates = [
  ["16-climbx", "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/00/cd/9a/00cd9af6-c2e1-6f56-6834-70dd6fcf8041/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg"],
  ["16-linglevel", "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/f9/6a/96/f96a9617-f0c1-0094-4602-b763d08cce47/1355.jpg/600x1300bb.webp"],
  ["16-perfect-swing", "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/d0/e0/4a/d0e04aca-fb45-87c7-3d1f-d9e39e235906/01.png/600x1300bb.webp"],
  ["16-trieyes", "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/ea/58/ae/ea58ae66-765c-e482-4c9a-feddf089636f/AppIcon-0-0-1x_U007emarketing-0-8-0-85-220.png/1200x630wa.jpg"],
  ["16-urban-breeze", "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/05/77/c1/0577c164-2665-4ec9-2d9e-73f884bf033c/Simulator_Screenshot_-_iPhone_11_Pro_Max_-_2025-10-05_at_02.17.04.png/600x1300bb.webp"],
  ["16-cats-library", "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/5f/96/e9/5f96e978-db46-0ba3-9eaf-b1ac65ae6fbf/1242_2688_1.png/600x1300bb.webp"],
  ["16-daltanyang", "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/33/a8/a6/33a8a6d0-e73c-e4f6-221d-90dddd459b67/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/1200x630wa.jpg"],
  ["16-phenokio", "https://play-lh.googleusercontent.com/1CyYkG11TLiO4YxZwmJgIHm3oL6Hn1M6jBfALUCxElJJ5vq4xRmxnK9FIhYJEvXOQlPBkNC0QshzZY1pZI4fbw=w480-h960-rw"],
  ["15-ono", "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/fb/4b/d9/fb4bd9ae-ea9e-d046-ee18-5cbe709edd06/HomeScreen.png/600x1300bb.webp"],
  ["15-tinkly", "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource211/v4/39/12/a9/3912a98a-6865-9d2c-97ef-406e086b1831/a14af03b-34a3-4ab8-9b5b-94da57707e06__U1111_U116d_U110c_U11751_6.7.png/600x1300bb.webp"],
  ["15-singsongsangsong", "https://play-lh.googleusercontent.com/nTqSQbdBRC8m3InQePFcmequm3JBL4xmvzOUM-Pe2DG5B0wd8k84gPuwfoMSoHP_KJM=w480-h960-rw"],
  ["15-udada", "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource221/v4/96/6e/ee/966eee62-c791-c268-98f1-f4925aa30103/1242_x_2688.png/600x1300bb.webp"],
  ["14-lingo-talk", "https://play-lh.googleusercontent.com/ABl8JL40TAmJjlU8Xpb9aRBG1pU3DjpApkDzqLWdpsB-uAZkbUYEQQCC83jDbxzMJqvn=w480-h960-rw"],
  ["13-conopot", "https://play-lh.googleusercontent.com/u7g8KEgRTJYoYZcxVnLJUn6AWabB4lMGsNxrV5sCvsxIeEwEzCVFHD-FVOFJn2Cy1k5i=w480-h960-rw"],
  ["12-fleek", "https://play-lh.googleusercontent.com/wREmqoEVqyBlBVYzrf_5PCIgACfBUlvEC7C345i12jQNUJiH1lDDBzhITymyXpaiIOo=w480-h960-rw"],
  ["12-thinkme-m", "https://is1-ssl.mzstatic.com/image/thumb/PurpleSource116/v4/b0/77/89/b077895f-86b7-66fd-eaa0-f9cb0e09e468/5b517605-9862-4d7d-a515-079f5c3b3ff9__U110f_U1165_U1107_U1165.png/600x1300bb.webp"],
  ["8-store-apps-details", "https://play-lh.googleusercontent.com/1DpmImM2VVU4Ny4FJEAOeiVLNZ5oXJRBx7p7cVeQWenriPBv0ik4VthFaJA4FZZxqDuUPnIhfunYuRzrIm9gcg=w480-h960-rw"],
  ["16-filient", "https://filient.ai/og-image.png"],
  ["16-ghostrunner", "https://ghostrun.io/og.png"],
  ["16-kokomen", "https://kokomen.kr/og/main.png"],
  ["16-cheftory", "https://www.cheftories.com/images/hero/app-share.png"],
  ["15-metive", "https://metive.app/docs/assets/images/image-84067a8b3ed160243802275ecfdea489.png"],
  ["14-kezzle", "https://linktr.ee/og/image/kezzlecake.jpg"],
  ["14-kumo-factory", "https://www.higeuni.com/_app/immutable/assets/og-image.CvWs4ZH9.png"],
  ["14-brain-vitamin", "https://brain-vitamin.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fscreening-test.b6a80d86.png&w=3840&q=75"],
  ["14-collectime", "https://collecti.me/temporary_image.png"],
  ["15-card-capture", "https://opengraph.githubassets.com/53949d1463a3403040b7f614d388776b18f96e2b638ce5805e18d9b6abf3bb46/SW-rocket-dan/card-capture-fe"],
  ["15-caremeet", "https://github.com/user-attachments/assets/dddade49-d61b-4c68-be1d-4e1365499158"],
  ["15-jabiseo", "https://github.com/user-attachments/assets/9aa37224-5e14-4590-b186-2b965bb87ad1"],
  ["15-project-lcs", "https://opengraph.githubassets.com/18f682e320bba20b71c93a083573ee621b416292d25ed5761890d1166dd5adeb/projectlcs/lcs"],
  ["15-newsnack", "https://github.com/user-attachments/assets/af9f9d9c-4603-4cf5-9607-8d7d85dc4531"],
  ["15-mykkumi", "https://github.com/user-attachments/assets/09faed84-1f1e-42a7-87a3-483035538c6d"],
  ["14-cafe-pos", "https://github.com/AII-the-time/POS_Android/assets/64644738/c1e655c9-de58-41cb-8d1b-b9a5dafc32f7"],
  ["14-coclimb", "https://github.com/JJBINY/coclimb-backend/assets/97151887/d9f86389-685c-417a-b91e-02c7cb2bdf40"],
  ["14-dadamda", "https://github.com/SWM-team-forever/dadamda-frontend/assets/83866983/0cb4de4b-1496-4a6e-805a-ba7e38f9f25d"],
  ["14-finote", "https://github.com/YuriKwon/web08-ChoBab/assets/55318618/23cc16c0-cafb-41f0-a1b5-3cdadd48dfc0"],
  ["14-jaribean", "https://hackmd.io/_uploads/BJsA5TEsh.png"],
  ["14-petmily", "https://opengraph.githubassets.com/d8f48b916dbf8b58850f2c3e66db88306902b3b9f229937ee55ac6d69a463f13/SWM-Petmily/SWM-iOS"],
  ["14-pocket-pt", "https://avatars.githubusercontent.com/u/135003010?s=280&v=4"],
  ["13-so1s", "https://avatars.githubusercontent.com/u/105417775?s=280&v=4"],
  ["12-avoid-huduck", "https://raw.githubusercontent.com/swm-huduck/avoid-android-app/master/readme_src/AVOiD-background.png"],
  ["12-bizkicks", "https://github.com/Chanhook/Bizkicks-Frontend/assets/76461625/b1ab8b3a-945f-4d30-a9e5-48cfa4c30d63"],
  ["12-coloraid-null-ai", "https://user-images.githubusercontent.com/52124204/140652933-6b513090-cbfc-4b0b-a698-fd2049f7539b.png"],
  ["12-connectee", "https://raw.githubusercontent.com/QuiD-0/connectee/master/README.assets/appimage.png"],
  ["12-duder", "https://raw.githubusercontent.com/soma-12-duder/duder/master/images/Duder_image.png"],
  ["12-lolgo", "https://user-images.githubusercontent.com/37856995/139629595-36c0ca61-f6f2-4538-869a-416604acb7c9.png"],
  ["12-momspt", "https://user-images.githubusercontent.com/54823396/140651996-cb0a3c84-1771-4604-9c6a-ae507eeb7b25.png"],
  ["12-pentatonic", "https://user-images.githubusercontent.com/30336663/140635943-b4361df2-cf61-4d94-aef4-957e3f655a36.jpg"],
  ["12-real-gamer-s-critics-argonaut", "https://raw.githubusercontent.com/SWM-argonaut/Real-Gamers-Critics/master/README/inapp01.png"],
  ["12-unboxing-monster", "https://img.youtube.com/vi/MBVXpolEiW0/0.jpg"],
  ["12-wagglewaggle", "https://img.youtube.com/vi/8EVDd16Pt6I/0.jpg"],
  ["12-webox", "https://raw.githubusercontent.com/wjdtmddnr24/webox/master/assets/img/slide_5.png"],
  ["12-gjgs", "https://raw.githubusercontent.com/backtony/SW-Maestro-gjgs/master/images/logo.PNG"],
  ["12-stg0123-soma-mainserver", "https://raw.githubusercontent.com/stg0123/SOMA_MainServer/master/resource/front-end1.png"],
  ["12-algopa", "https://user-images.githubusercontent.com/47051596/140640554-4c79d5a8-55a0-4576-bb0d-a1e93d9dd9a8.png"],
  ["12-canis-lupus-web", "https://raw.githubusercontent.com/LiiNen/LiiNen/main/images/flutter-b2k/pages2.jpg"],
  ["11-aircom", "https://github.com/Bor1bori/images/blob/master/23.gif?raw=true"],
  ["11-createtrend", "https://raw.githubusercontent.com/gangslee/CreateTrend-Client/master/src/Asset/images/ScreenShot/Homepage.png"],
  ["11-goodpoopee", "https://raw.githubusercontent.com/badger777/goodpp-frontend/master/readme_media/gpp_frontend.jpeg"],
  ["11-sotact", "https://raw.githubusercontent.com/esllo/sotact-client/master/arch.png"],
  ["10-letstouch", "https://user-images.githubusercontent.com/30704569/69841418-5cd9c900-12a2-11ea-8d5c-cda19bc841c5.png"],
  ["10-rapidcheck", "https://raw.githubusercontent.com/YeongjinOh/RapidCheck/master/images_md/base.png"],
  ["10-dnbn", "https://opengraph.githubassets.com/soma-projects/BearHunter49/DNBN"],
  ["10-image-inpainting-and-image-detection", "https://opengraph.githubassets.com/bab84ff58e11b59b411a70749badb14619ffd8afa07660124fa1ae301a75ee43/INCHEON-CHO/CRF_APP"],
  ["11-bwai-bwai", "https://opengraph.githubassets.com/soma-projects/BWAI-SWmaestro/Homepage"],
  ["11-notebank", "https://i.ytimg.com/vi/Uk5JXgzGJmU/hqdefault.jpg"],
  ["11-perpetmatch", "https://i.ytimg.com/vi/-towwo7l8zU/hqdefault.jpg"],
  ["10-flower", "https://i.ytimg.com/vi/hMoJh5K7SQo/hqdefault.jpg"],
  ["10-fruit-flavor", "https://i.ytimg.com/vi/cZrfc4-vTvE/hqdefault.jpg"],
  ["10-lisn", "https://i.ytimg.com/vi/eeA4qRB2BZ4/hqdefault.jpg"],
  ["10-scade", "https://i.ytimg.com/vi/5qAa10Nne2g/hqdefault.jpg"],
  ["10-watch", "https://i.ytimg.com/vi/8qMG1w4bCgw/hqdefault.jpg"],
  ["8-watch", "https://i.ytimg.com/vi/SpHiasNyHsY/hqdefault.jpg"],
  ["6-give-me-task-gime-me", "https://i.ytimg.com/vi/PP8_6by6JBQ/hqdefault.jpg"],
  ["6-watch", "https://i.ytimg.com/vi/0-0eRrOgxjU/hqdefault.jpg"],
];

const rejectedIds = new Set([
  "16-ai-skill-checker",
  "15-wherehaus",
  "14-seity",
  "13-alardin",
  "13-triget",
  "13-smart-electric-app",
  "13-yeoreodigm",
  "12-aiqa",
  "12-sw-bbs-b0000006-view-do-3",
  "12-sw-bbs-b0000006-view-do-4",
  "11-ai-based-spam-detection-system",
  "10-posts-makkcha",
  "8-sw-bbs-b0000015-view-do",
  "6-goni",
  "6-taekwondo",
  "6-20161018000155",
  "6-20161018000155-2",
  "5-resume",
  "5-smartcover",
  "4-easy-ad-screen",
  "4-elder-care-solution",
  "4-legacy-007",
  "4-legacy-008",
  "3-tokki-rush",
  "3-urqa",
  "2-monymony",
  "1-locatead",
  "1-201110250117",
  "1-movie-collection",
  "1-201110250117-2",
]);

const rejectedUrlPatterns = [
  /logo_200\.jpg/i,
  /tistory_admin\/static\/images\/openGraph\/opengraph\.png/i,
  /facebookblank\.png/i,
  /asiae_news\.png/i,
  /ajunews_shareimg\.png/i,
  /skillicons\.dev/i,
  /\/apple-icon-\d+x\d+/i,
  /\/favicon/i,
  /\/gh_icon\.png/i,
  /docs\/img\/logo\.png/i,
  /blog\.wlgh7407\.com\/images\/logo\.png/i,
  /whereha\.us\/icon\.png/i,
  /patrick_blog\/logo\.png/i,
  /corikachu\.github\.io\/img\/avatar\.jpg/i,
  /thevc\.kr\/icons\//i,
];

function isRejected(id, imageUrl) {
  if (!imageUrl) return true;
  if (rejectedIds.has(id)) return true;
  return rejectedUrlPatterns.some((pattern) => pattern.test(imageUrl));
}

function isAutoCandidateAccepted(candidate) {
  if (isRejected(candidate.id, candidate.imageUrl)) return false;
  if (candidate.strategy === "html-image" && candidate.score < 58) return false;
  if (candidate.confidence === "high") return true;
  if (candidate.strategy === "github-og-image" && !candidate.imageUrl.includes("avatars.githubusercontent.com")) return true;
  if (["og:image", "twitter:image", "html-image"].includes(candidate.strategy) && candidate.score >= 68) return true;
  return candidate.score >= 82;
}

const projects = JSON.parse(await readFile(projectsPath, "utf8"));
const report = JSON.parse(await readFile(reportPath, "utf8"));
const byId = new Map();

for (const candidate of report.candidates) {
  if (isAutoCandidateAccepted(candidate)) {
    byId.set(candidate.id, candidate.imageUrl);
  }
}

for (const [id, imageUrl] of manualCandidates) {
  if (!isRejected(id, imageUrl)) {
    byId.set(id, imageUrl);
  }
}

const updatedIds = [];
const updatedProjects = projects.map((project) => {
  if (project.imageUrl || !byId.has(project.id)) return project;

  updatedIds.push(project.id);
  return {
    ...project,
    imageUrl: byId.get(project.id),
  };
});

await writeFile(projectsPath, `${JSON.stringify(updatedProjects, null, 2)}\n`);

const summary = {
  candidateCount: byId.size,
  updatedCount: updatedIds.length,
  updatedIds,
};

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
