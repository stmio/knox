import * as crypto from "crypto";
import { getParams } from "./params.js";

// Use 1024-bit group if testing, use 4096-bit group otherwise
const params = process.env.NODE_ENV === "test" ? getParams(1024) : getParams(4096);

