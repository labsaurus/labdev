// ... existing menu items ...
<<<<<<< HEAD
<ListItem component={Link} to="/notes" button>
=======
import { ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import NotesIcon from "@mui/icons-material/Notes";

<ListItem component={Link} to="/notes">
>>>>>>> 07633a1 (Initial commit)
  <ListItemIcon>
    <NotesIcon />
  </ListItemIcon>
  <ListItemText primary="Notes" />
</ListItem>