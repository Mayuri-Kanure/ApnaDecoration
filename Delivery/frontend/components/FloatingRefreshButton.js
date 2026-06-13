import { Fab, Tooltip } from "@mui/material";
import { Refresh } from "@mui/icons-material";

/**
 * Fixed floating refresh — shows on every page (not in navbar).
 */
export default function FloatingRefreshButton() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Tooltip title="Refresh page" placement="left">
      <Fab
        aria-label="Refresh page"
        onClick={handleRefresh}
        sx={{
          position: "fixed",
          bottom: { xs: 20, md: 28 },
          right: { xs: 16, md: 24 },
          zIndex: 1300,
          width: 56,
          height: 56,
          background: "linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)",
          color: "#fff",
          boxShadow: "0 8px 28px rgba(59, 130, 246, 0.45)",
          "&:hover": {
            background: "linear-gradient(135deg, #2563eb 0%, #0891b2 100%)",
            boxShadow: "0 10px 32px rgba(37, 99, 235, 0.5)",
          },
        }}
      >
        <Refresh />
      </Fab>
    </Tooltip>
  );
}
