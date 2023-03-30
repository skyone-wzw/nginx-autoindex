import {Box, Button, Card, CardMedia, Container, Typography} from "@mui/material";
import {Component, ReactNode} from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    state = {hasError: false};
    rollback = (
        <Box className="rollback" sx={{
            position: "fixed",
            display: "flex",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            flexFlow: "column nowrap",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <Container maxWidth="sm" sx={{zIndex: 99}}>
                <Card sx={{mt: 1, mb: 1}}>
                    <CardMedia
                        component="img"
                        image="/nginx-autoindex/error.webp"
                        alt="网页崩溃了"
                    />
                </Card>
                <Typography variant="h3" align="center" component="h2">
                    网页崩溃了😨
                </Typography>
                <Button sx={{mt: 2}} variant="contained" fullWidth onClick={() => {
                    window.location.reload();
                }}>刷新重试</Button>
            </Container>
        </Box>
    );

    static getDerivedStateFromError() {
        return {hasError: true};
    }

    render() {
        if (this.state.hasError) {
            return this.rollback;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
