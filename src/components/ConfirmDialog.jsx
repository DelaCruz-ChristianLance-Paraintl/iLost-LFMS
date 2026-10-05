import { AlertDialog } from '@base-ui/react/alert-dialog'

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
}) {
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="confirm-dialog-backdrop" />
        <AlertDialog.Viewport className="confirm-dialog-viewport">
          <AlertDialog.Popup className="confirm-dialog-popup">
            <div className="confirm-dialog-content">
              <AlertDialog.Title className="confirm-dialog-title">
                {title}
              </AlertDialog.Title>
              <AlertDialog.Description className="confirm-dialog-description">
                {description}
              </AlertDialog.Description>
            </div>

            <div className="confirm-dialog-actions">
              <AlertDialog.Close
                render={
                  <button
                    className="confirm-dialog-cancel"
                    type="button"
                  >
                    {cancelLabel}
                  </button>
                }
              />
              <button
                className={`confirm-dialog-confirm ${
                  destructive ? 'is-destructive' : ''
                }`}
                type="button"
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default ConfirmDialog
