// Single monotonic id source — survives component remounts (module scope),
// seeded above all seed ids (tasks t-1xx/2xx/3xx, messages m1..m7).
let t = 400;
let m = 900;
export const nextTaskId = () => `t-${++t}`;
export const nextMsgId = () => `m-${++m}`;
export const nextCommentId = () => `c-${++m}`;
