import React from 'react';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper } from '@material-ui/core';

import Draggable from 'react-draggable';

/**
 * PaperComponent
 *
 * @param {*} props
 * @return {*} 
 */
function PaperComponent(props: any): JSX.Element {
	return (
		<Draggable handle="#settings-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
			<Paper {...props} />
		</Draggable>
	);
}

/**
 * Settings
 *
 * @export
 * @return {*} 
 */
export default function Settings(): any {
	const [ open, setOpen ] = React.useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	return (
		<React.Fragment>
			<Button variant="outlined" color="primary" onClick={handleClickOpen}>
				Open form dialog
			</Button>
			<Dialog
				open={open}
				onClose={handleClose}
				PaperComponent={PaperComponent}
				aria-labelledby="settings-dialog-title"
			>
				<DialogTitle style={{ cursor: 'move' }} id="settings-dialog-title">
					Subscribe
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						To subscribe to this website, please enter your email address here. We will send updates
						occasionally.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={handleClose} color="primary">
						Cancel
					</Button>
					<Button onClick={handleClose} color="primary">
						Subscribe
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	);
}
