using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace StudyAppLauncher
{
    static class Program
    {
        private const string AppName = "VoxPilot TOEFL 2026 Study Suite";
        private const int DefaultPort = 5173;
        private const string ExpectedBodyHint = "VoxPilot";

        [STAThread]
        static int Main(string[] args)
        {
            bool smokeTest = false;
            foreach (string a in args)
            {
                if (string.Equals(a, "--smoke-test", StringComparison.OrdinalIgnoreCase))
                {
                    smokeTest = true;
                }
            }

            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string serverJs = Path.Combine(baseDir, "server.js");

            if (!File.Exists(serverJs))
            {
                string msg = "Could not find server.js in:\n" + baseDir;
                if (smokeTest) { Console.Error.WriteLine(msg); return 2; }
                MessageBox.Show(msg, AppName, MessageBoxButtons.OK, MessageBoxIcon.Error);
                return 2;
            }

            string nodeExe = FindNodeExecutable();
            if (string.IsNullOrEmpty(nodeExe))
            {
                string msg = "Node.js was not found on PATH.\nPlease install Node.js 18+ from https://nodejs.org and try again.";
                if (smokeTest) { Console.Error.WriteLine(msg); return 3; }
                MessageBox.Show(msg, AppName, MessageBoxButtons.OK, MessageBoxIcon.Error);
                return 3;
            }

            if (!smokeTest && IsOurServerRunning(DefaultPort))
            {
                OpenUrl("http://127.0.0.1:" + DefaultPort + "/");
                return 0;
            }

            int port = FindFreePort(smokeTest ? DefaultPort + 110 : DefaultPort);
            string nodeArgs = string.Format("\"{0}\"", serverJs);
            string url = "http://127.0.0.1:" + port + "/";

            if (smokeTest)
            {
                Process proc = StartServerProcess(nodeExe, nodeArgs, baseDir, port);
                try
                {
                    bool ready = WaitForHttpOk(url, 15000);
                    if (!ready)
                    {
                        Console.Error.WriteLine("SMOKE_FAIL: Timed out waiting for " + url);
                        return 4;
                    }
                    Console.WriteLine("SMOKE_OK: " + AppName + " serving at " + url);
                    return 0;
                }
                finally
                {
                    StopProcessTree(proc);
                }
            }

            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new LauncherForm(AppName, url, nodeExe, nodeArgs, baseDir, port));
            return 0;
        }

        internal static string FindNodeExecutable()
        {
            try
            {
                var psi = new ProcessStartInfo("where.exe", "node.exe")
                {
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    CreateNoWindow = true
                };
                using (var p = Process.Start(psi))
                {
                    string outText = p.StandardOutput.ReadToEnd();
                    p.WaitForExit(3000);
                    foreach (string line in outText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries))
                    {
                        string trimmed = line.Trim();
                        if (File.Exists(trimmed)) return trimmed;
                    }
                }
            }
            catch { }

            string fallback = @"C:\Program Files\nodejs\node.exe";
            return File.Exists(fallback) ? fallback : null;
        }

        internal static bool IsOurServerRunning(int port)
        {
            try
            {
                var req = (HttpWebRequest)WebRequest.Create("http://127.0.0.1:" + port + "/");
                req.Timeout = 1000;
                using (var resp = (HttpWebResponse)req.GetResponse())
                using (var sr = new StreamReader(resp.GetResponseStream()))
                {
                    string body = sr.ReadToEnd();
                    return resp.StatusCode == HttpStatusCode.OK && body.IndexOf(ExpectedBodyHint, StringComparison.OrdinalIgnoreCase) >= 0;
                }
            }
            catch
            {
                return false;
            }
        }

        internal static int FindFreePort(int startPort)
        {
            for (int p = startPort; p < startPort + 40; p++)
            {
                TcpListener l = null;
                try
                {
                    l = new TcpListener(IPAddress.Loopback, p);
                    l.Start();
                    l.Stop();
                    return p;
                }
                catch
                {
                    if (l != null) { try { l.Stop(); } catch { } }
                }
            }
            return startPort;
        }

        internal static Process StartServerProcess(string nodeExe, string args, string workDir, int port)
        {
            var psi = new ProcessStartInfo(nodeExe, args)
            {
                WorkingDirectory = workDir,
                UseShellExecute = false,
                CreateNoWindow = true,
                RedirectStandardOutput = true,
                RedirectStandardError = true
            };
            psi.EnvironmentVariables["PORT"] = port.ToString();
            var proc = new Process { StartInfo = psi };
            proc.OutputDataReceived += (s, e) => { };
            proc.ErrorDataReceived += (s, e) => { };
            proc.Start();
            proc.BeginOutputReadLine();
            proc.BeginErrorReadLine();
            return proc;
        }

        internal static bool WaitForHttpOk(string url, int timeoutMs)
        {
            var sw = Stopwatch.StartNew();
            while (sw.ElapsedMilliseconds < timeoutMs)
            {
                try
                {
                    var req = (HttpWebRequest)WebRequest.Create(url);
                    req.Timeout = 1500;
                    using (var resp = (HttpWebResponse)req.GetResponse())
                    {
                        if (resp.StatusCode == HttpStatusCode.OK) return true;
                    }
                }
                catch { }
                Thread.Sleep(250);
            }
            return false;
        }

        internal static void OpenUrl(string url)
        {
            try
            {
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }
            catch { }
        }

        internal static void StopProcessTree(Process proc)
        {
            if (proc == null) return;
            try
            {
                if (!proc.HasExited)
                {
                    var killer = new ProcessStartInfo("taskkill", "/PID " + proc.Id + " /T /F")
                    {
                        UseShellExecute = false,
                        CreateNoWindow = true
                    };
                    using (var k = Process.Start(killer))
                    {
                        k.WaitForExit(3000);
                    }
                }
            }
            catch { }
            finally
            {
                try { proc.Dispose(); } catch { }
            }
        }
    }

    class LauncherForm : Form
    {
        private readonly string _url;
        private readonly string _nodeExe;
        private readonly string _nodeArgs;
        private readonly string _workDir;
        private readonly int _port;
        private Process _serverProc;
        private Label _statusLabel;
        private Button _openBtn;
        private Button _copyBtn;
        private Button _stopBtn;

        public LauncherForm(string title, string url, string nodeExe, string nodeArgs, string workDir, int port)
        {
            _url = url;
            _nodeExe = nodeExe;
            _nodeArgs = nodeArgs;
            _workDir = workDir;
            _port = port;

            Text = title;
            FormBorderStyle = FormBorderStyle.FixedSingle;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            ClientSize = new Size(420, 175);
            BackColor = Color.FromArgb(246, 247, 249);
            Font = new Font("Segoe UI", 9.5f);

            var header = new Panel
            {
                Dock = DockStyle.Top,
                Height = 52,
                BackColor = Color.FromArgb(13, 122, 111)
            };
            var headerLbl = new Label
            {
                Text = title,
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 11.5f, FontStyle.Bold),
                AutoSize = true,
                Location = new Point(16, 15)
            };
            header.Controls.Add(headerLbl);
            Controls.Add(header);

            _statusLabel = new Label
            {
                Text = "Starting local server on " + _url + " ...",
                ForeColor = Color.FromArgb(20, 28, 36),
                Location = new Point(16, 68),
                Size = new Size(388, 38)
            };
            Controls.Add(_statusLabel);

            _openBtn = new Button
            {
                Text = "Open in Browser",
                Enabled = false,
                Location = new Point(16, 118),
                Size = new Size(138, 36),
                BackColor = Color.FromArgb(13, 122, 111),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            _openBtn.FlatAppearance.BorderSize = 0;
            _openBtn.Click += (s, e) => Program.OpenUrl(_url);
            Controls.Add(_openBtn);

            _copyBtn = new Button
            {
                Text = "Copy URL",
                Location = new Point(164, 118),
                Size = new Size(100, 36),
                BackColor = Color.White,
                ForeColor = Color.FromArgb(20, 28, 36),
                FlatStyle = FlatStyle.Flat
            };
            _copyBtn.Click += (s, e) =>
            {
                try { Clipboard.SetText(_url); _statusLabel.Text = "Copied " + _url + " to clipboard."; } catch { }
            };
            Controls.Add(_copyBtn);

            _stopBtn = new Button
            {
                Text = "Stop && Exit",
                Location = new Point(274, 118),
                Size = new Size(130, 36),
                BackColor = Color.FromArgb(180, 83, 9),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat
            };
            _stopBtn.FlatAppearance.BorderSize = 0;
            _stopBtn.Click += (s, e) => Close();
            Controls.Add(_stopBtn);

            Shown += OnFormShown;
            FormClosing += (s, e) => Program.StopProcessTree(_serverProc);
        }

        private async void OnFormShown(object sender, EventArgs e)
        {
            try
            {
                _serverProc = Program.StartServerProcess(_nodeExe, _nodeArgs, _workDir, _port);
                bool ready = await Task.Run(() => Program.WaitForHttpOk(_url, 15000));
                if (IsDisposed) return;
                if (ready)
                {
                    _statusLabel.Text = "Running at " + _url + "\nKeep this window open while studying. Close to stop the server.";
                    _openBtn.Enabled = true;
                    Program.OpenUrl(_url);
                }
                else
                {
                    _statusLabel.Text = "Server did not respond within 15s. Check Node.js setup.";
                }
            }
            catch (Exception ex)
            {
                if (!IsDisposed) _statusLabel.Text = "Failed to start: " + ex.Message;
            }
        }
    }
}
