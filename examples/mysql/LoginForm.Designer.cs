namespace Dkip;

partial class LoginForm
{
    private Label LoginLabel = null!;
    private TextBox LoginInput = null!;
    private Label PasswordLabel = null!;
    private TextBox PasswordInput = null!;
    private Label PuzzleLabel = null!;
    private PuzzleControl Puzzle = null!;
    private Button SignInButton = null!;

    private void InitializeComponent()
    {
        LoginLabel = new Label();
        LoginInput = new TextBox();
        PasswordLabel = new Label();
        PasswordInput = new TextBox();
        PuzzleLabel = new Label();
        Puzzle = new PuzzleControl();
        SignInButton = new Button();
        SuspendLayout();

        LoginLabel.Name = "LoginLabel";
        LoginLabel.Text = "Логин";
        LoginLabel.Location = new Point(24, 20);
        LoginLabel.AutoSize = true;
        LoginInput.Name = "LoginInput";
        LoginInput.Location = new Point(24, 46);
        LoginInput.Width = 490;
        LoginInput.AccessibleName = "Логин";
        LoginInput.TabIndex = 0;
        PasswordLabel.Name = "PasswordLabel";
        PasswordLabel.Text = "Пароль";
        PasswordLabel.Location = new Point(24, 82);
        PasswordLabel.AutoSize = true;
        PasswordInput.Name = "PasswordInput";
        PasswordInput.Location = new Point(24, 108);
        PasswordInput.Width = 490;
        PasswordInput.AccessibleName = "Пароль";
        PasswordInput.UseSystemPasswordChar = true;
        PasswordInput.TabIndex = 1;
        PuzzleLabel.Name = "PuzzleLabel";
        PuzzleLabel.Text = "Соберите изображение: выберите два фрагмента";
        PuzzleLabel.Location = new Point(24, 150);
        PuzzleLabel.AutoSize = true;
        Puzzle.Name = "Puzzle";
        Puzzle.Location = new Point(24, 180);
        Puzzle.TabIndex = 2;
        SignInButton.Name = "SignInButton";
        SignInButton.Text = "Войти";
        SignInButton.Location = new Point(24, 402);
        SignInButton.Size = new Size(490, 34);
        SignInButton.TabIndex = 3;
        SignInButton.Click += SignIn;

        AutoScaleMode = AutoScaleMode.Font;
        ClientSize = new Size(540, 460);
        StartPosition = FormStartPosition.CenterScreen;
        Text = "Вход";
        Font = new Font("Segoe UI", 11F);
        AutoScaleDimensions = new SizeF(8F, 20F);
        FormBorderStyle = FormBorderStyle.FixedDialog;
        MaximizeBox = false;
        AcceptButton = SignInButton;
        Controls.Add(LoginLabel);
        Controls.Add(LoginInput);
        Controls.Add(PasswordLabel);
        Controls.Add(PasswordInput);
        Controls.Add(PuzzleLabel);
        Controls.Add(Puzzle);
        Controls.Add(SignInButton);
        ResumeLayout(false);
        PerformLayout();
    }
}
