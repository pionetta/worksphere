import { BottomSheet } from '@/components/ui/BottomSheet'
import { MasterCalendar } from './MasterCalendar'
import type { MasterCalendarEvent } from '@/services/masterCalendarService'

interface CalendarModalProps {
  open: boolean
  onClose: () => void
  userId: string
  onEventClick?: (event: MasterCalendarEvent) => void
}

export function CalendarModal({ open, onClose, userId, onEventClick }: CalendarModalProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Kalender Terpadu">
      <div className="pb-6 max-h-[80vh] overflow-y-auto">
        <MasterCalendar
          userId={userId}
          onEventClick={ev => {
            onEventClick?.(ev)
          }}
        />
      </div>
    </BottomSheet>
  )
}
