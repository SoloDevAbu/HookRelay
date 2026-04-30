import express from "express";

const app = express();
app.use(express.json());

const FAILURE_RATE = Number(process.env.FAILURE_RATE || 0.2); // 20%
const DELAY_MS = Number(process.env.DELAY_MS || 0);

app.post("/webhook", async (req, res) => {
  if (DELAY_MS) {
    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  if (Math.random() < FAILURE_RATE) {
    console.log("❌ Failed");
    return res.status(500).send("fail");
  }

  console.log("✅ Success");
  res.status(200).send("ok");
});

app.get("/health", (_, res) => res.send("ok"));

app.listen(4000, () => {
  console.log("Mock running on :4000");
});
