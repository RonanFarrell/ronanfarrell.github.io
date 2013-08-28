function Gamepad(index)
{
	this.A = 0; // 0
	this.X = 0; // 1
	this.B = 0; // 2
	this.Y = 0;	// 3

	this.dPadLeft = 0;  //14
	this.dPadRight = 0; //15

	this.leftStickX = 0;

	this.rightStickX = 0;
	this.rightStickY = 0;

	this.rightTrigger = 0;

	this.prevA = 0; // 0
	this.prevX = 0; // 1
	this.prevB = 0; // 2
	this.prevY = 0;	// 3

	this.prevDPadRight = 0;
	this.prevDPadLeft = 0;

	this.prevLeftStickX = 0;

	this.deadZone = 0.3;

	this.padIndex = index;

	this.gamepad = navigator.webkitGetGamepads &&
					navigator.webkitGetGamepads()[index];
}

Gamepad.prototype.update = function()
{
	this.gamepad = navigator.webkitGetGamepads &&
					navigator.webkitGetGamepads()[this.padIndex];

	if (this.gamepad)
	{
		this.prevA = this.A;
		this.prevX = this.X;
		this.prevB = this.B;
		this.prevY = this.Y;

		this.prevDPadLeft = this.dPadLeft;
		this.prevDPadRight = this.dPadRight;

		this.prevLeftStickX = this.leftStickX;

		this.A = this.gamepad.buttons[0];
		this.X = this.gamepad.buttons[2];
		this.B = this.gamepad.buttons[1];
		this.Y = this.gamepad.buttons[3];

		this.leftStickX = this.gamepad.axes[0];

		if (Math.abs(this.leftStickX) < this.deadZone)
			this.leftStickX = 0;

		this.rightStickX = this.gamepad.axes[2];
		this.rightStickY = this.gamepad.axes[3];

		this.dPadLeft = this.gamepad.buttons[14];
		this.dPadRight = this.gamepad.buttons[15];
	}
};