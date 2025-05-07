import express from "express";
import getMessages from "./getMessages";

import postMessage from "./postMessage";

const router = express.Router();

router.use(getMessages);
router.use(postMessage);

export default router;
