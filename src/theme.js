export const T = {
  bg:         "#070F1E",
  card:       "#0E1E35",
  cardHover:  "#132540",
  border:     "#1A3050",
  accent:     "#00C9A7",
  accentDim:  "#00856E",
  gold:       "#FFB300",
  red:        "#FF4D6D",
  blue:       "#3B82F6",
  purple:     "#A855F7",
  text:       "#E8F0F8",
  muted:      "#6B8CAE",
  white:      "#FFFFFF",
};

export const cardStyle = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: 12,
  padding: "18px 20px",
};

export const labelStyle = {
  fontSize: 11,
  color: T.muted,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 4,
};

export const valueStyle = {
  fontSize: 26,
  fontWeight: 800,
  color: T.text,
  lineHeight: 1.1,
};

export const badgeStyle = (color) => ({
  background: color + "22",
  color,
  fontSize: 11,
  fontWeight: 700,
  padding: "2px 8px",
  borderRadius: 20,
});
