import { memo } from 'react'
import {
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { RowActions } from '../../components/RowActions'
import type { UserRole } from '../../types'

interface RoleListProps {
  roles: UserRole[]
  selectedId: string | null
  onSelect: (roleId: string) => void
  onEdit: (role: UserRole) => void
  onDelete: (role: UserRole) => void
}

export const RoleList = memo(function RoleList({
  roles,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: RoleListProps) {
  return (
    <List disablePadding>
      {roles.map((role, index) => (
        <ListItem
          key={role.id}
          disablePadding
          divider={index < roles.length - 1}
          secondaryAction={
            <RowActions
              label={role.name}
              onEdit={() => onEdit(role)}
              onDelete={() => onDelete(role)}
              deleteDisabled={role.system}
              deleteDisabledReason="Built-in roles cannot be deleted"
            />
          }
        >
          {/*
            `selected` drives the tint, but the matrix beside it is what
            actually changes — so the button also carries `aria-current` to say
            which role the panel is showing.
          */}
          <ListItemButton
            selected={role.id === selectedId}
            onClick={() => onSelect(role.id)}
            aria-current={role.id === selectedId}
            sx={{ pr: 12, py: 1.5 }}
          >
            <ListItemText
              primary={
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {role.name}
                  </Typography>
                  {role.system ? (
                    <Chip size="small" variant="outlined" label="Built-in" />
                  ) : null}
                </Stack>
              }
              secondary={
                <>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    {role.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {role.memberCount}{' '}
                    {role.memberCount === 1 ? 'member' : 'members'}
                  </Typography>
                </>
              }
              slotProps={{ secondary: { component: 'span' } }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
})
