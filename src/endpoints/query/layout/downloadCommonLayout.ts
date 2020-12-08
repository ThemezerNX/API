import Layout from "../../../filetypes/Layout";

export default async (_parent, {id}, _context, _info) => {
    try {
        const layout = new Layout(true);
        await layout.loadId(id);
        return layout.toJSON();
    } catch (e) {
        console.error(e);
        throw new Error(e);
    }
}