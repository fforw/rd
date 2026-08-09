export function buttonPressed(b) {
    if (typeof b === "object") {
        return b.pressed;
    }
    return b === 1.0;
}

export function clamp(v)
{
    return v < 0 ? 0 : v > 1 ? 1 : v;
}
