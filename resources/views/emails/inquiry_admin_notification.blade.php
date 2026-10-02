<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Inquiry Received</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background-color: #2563eb; color: #ffffff; padding: 20px 24px;">
            <h2 style="margin: 0; font-size: 20px;">New Inquiry Notification</h2>
            <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Ref: {{ $inquiry->reference_no }}</p>
        </div>
        <div style="padding: 24px;">
            <p style="margin-top: 0;">A new inquiry has been submitted via <strong>{{ ucfirst(str_replace('_', ' ', $inquiry->source)) }}</strong>.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="padding: 8px 0; color: #64748b; width: 140px; font-size: 14px;"><strong>Customer Name:</strong></td>
                    <td style="padding: 8px 0; font-size: 14px; color: #0f172a;">{{ $inquiry->name }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong></td>
                    <td style="padding: 8px 0; font-size: 14px; color: #0f172a;"><a href="mailto:{{ $inquiry->email }}">{{ $inquiry->email }}</a></td>
                </tr>
                @if($inquiry->phone)
                <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Phone:</strong></td>
                    <td style="padding: 8px 0; font-size: 14px; color: #0f172a;">{{ $inquiry->phone }}</td>
                </tr>
                @endif
                @if($inquiry->company)
                <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Company:</strong></td>
                    <td style="padding: 8px 0; font-size: 14px; color: #0f172a;">{{ $inquiry->company }}</td>
                </tr>
                @endif
                <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Subject:</strong></td>
                    <td style="padding: 8px 0; font-size: 14px; color: #0f172a; font-weight: 600;">{{ $inquiry->subject }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #64748b; font-size: 14px;"><strong>Priority:</strong></td>
                    <td style="padding: 8px 0; font-size: 14px; text-transform: uppercase;">{{ $inquiry->priority }}</td>
                </tr>
            </table>

            <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #334155;">Message Content:</h4>
                <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #1e293b; white-space: pre-wrap;">{{ $inquiry->message }}</p>
            </div>

            <p style="font-size: 13px; color: #94a3b8; margin-bottom: 0;">
                Log into the Inquiry Management Portal to assign, respond, or update lead status.
            </p>
        </div>
    </div>
</body>
</html>
