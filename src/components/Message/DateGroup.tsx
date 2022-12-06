import { Box, Chip, Divider, Stack, styled, Typography } from "@mui/material";
import { MessageItem } from "../../shared/types";
import { formatDateMessageGrouping } from "../../shared/utils";
export interface DateGroupProps {
  item: MessageItem;
}
const DateGroupContainer = styled(Divider)`
  .MuiChip-label {
    color: white;
  }
  user-select: none;
  pointer-events: none;
  :before,
  :after {
    border-top: thin solid rgba(255, 255, 255, 0.75);
  }
  .MuiChip-filled {
    background-color: rgb(255 220 220 / 8%);
  }
`;

const Root = styled("div")(({ theme }) => ({
  width: "100%",
  ...theme.typography.body2,
  "& > :not(style) + :not(style)": {
    marginTop: theme.spacing(2),
  },
}));
export const DateGroup = ({ item }: DateGroupProps) => {
  return (
    <Root>
      <DateGroupContainer light>
        <Chip label={formatDateMessageGrouping(item?.content)} />
      </DateGroupContainer>
    </Root>
  );
};
