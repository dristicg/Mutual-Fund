"use client";
import { Card, CardContent, Typography, CardActionArea } from "@mui/material";
import Link from "next/link";

export default function FundCard({ scheme }) {
  return (
    <Link href={`/scheme/${scheme.schemeCode}`} style={{ textDecoration: "none" }}>
      <Card elevation={3}>
        <CardActionArea>
          <CardContent>
            <Typography variant="subtitle1">{scheme.schemeName}</Typography>
            <Typography variant="body2" color="text.secondary">{scheme.fundHouse}</Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Link>
  );
}
